import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import type { Variant } from '../lib/variant.ts';
import type { Item } from '../lib/types.ts';
import { campusClock } from '../lib/clock.ts';
import { createItemSchema, emptyForm, type ItemFormValues } from './itemSchema.ts';
import { draftFields, meaningful } from './contracts.ts';
import { DescriptionField } from './DescriptionField.tsx';
import { submitReport } from './submitReport.ts';
import { stringStorage } from '../storage/asyncStorage.ts';
import { createDraftStore } from '../storage/draftStore.ts';
import { createDraftSession } from '../storage/draftSession.ts';
import { phoneStore } from '../storage/secureAdapter.ts';
import { formStyles as s } from './formStyles.ts';

type TextFieldName = Exclude<keyof ItemFormValues, 'handedToOffice'>;
export function ItemForm({ config }: { config: Variant }) {
  const router = useRouter();
  const schema = useMemo(() => createItemSchema(config), [config]);
  const { control, handleSubmit, reset, getValues, setError, setValue, clearErrors,
    formState: { errors, isSubmitting } } = useForm<ItemFormValues>({
      defaultValues: emptyForm(config), resolver: zodResolver(schema),
    });
  const observed = useWatch({ control });
  const [ready, setReady] = useState(false);
  const [draftNotice, setDraftNotice] = useState('Восстанавливаем черновик…');
  const [phoneNotice, setPhoneNotice] = useState('');
  const [created, setCreated] = useState<Item | null>(null);
  const active = useRef(true), submitted = useRef(false), locked = useRef(false);
  const lastQueued = useRef('');
  const store = useMemo(() => createDraftStore(stringStorage, config.number), [config.number]);
  const session = useMemo(() => createDraftSession(store, text => { if (active.current) setDraftNotice(text); }), [store]);

  useEffect(() => {
    active.current = true; let alive = true;
    async function restore() {
      const [draft, phone] = await Promise.all([
        store.load().catch(error => { if (alive) setDraftNotice(error instanceof Error ? error.message : 'Не удалось прочитать черновик'); return null; }),
        phoneStore.load().catch(error => { if (alive) setPhoneNotice(error instanceof Error ? error.message : 'Не удалось прочитать телефон'); return null; }),
      ]);
      if (!alive) return;
      const values = { ...emptyForm(config), ...(draft ?? {}), phone: phone ?? '' };
      reset(values); lastQueued.current = JSON.stringify(draftFields(values));
      if (draft) setDraftNotice('Черновик восстановлен');
      else setDraftNotice(current => current === 'Восстанавливаем черновик…' ? 'Черновика пока нет' : current);
      if (phone) setPhoneNotice('Сохранённый телефон подставлен');
      setReady(true);
    }
    void restore();
    return () => { alive = false; active.current = false; void session.flush().catch(() => {}); };
  }, [config, store, session, reset]);

  useEffect(() => {
    if (!ready || isSubmitting || submitted.current) return;
    const fields = draftFields(getValues()), value = JSON.stringify(fields);
    if (value === lastQueued.current) return;
    lastQueued.current = value;
    if (meaningful(fields)) session.schedule(fields);
  }, [observed, ready, isSubmitting, getValues, session]);

  async function send(values: ItemFormValues) {
    if (locked.current) return;
    locked.current = true; session.cancelTimer();
    try {
      const item = await submitReport(values, setError);
      if (!item) {
        await session.flush().catch(error => setDraftNotice(error instanceof Error ? error.message : 'Черновик недоступен'));
        return;
      }
      submitted.current = true;
      setCreated(item);
      try { await session.clear(); setDraftNotice('Находка сохранена. Черновик удалён'); }
      catch (error) { setDraftNotice('Находка сохранена, но черновик не удалён: ' + (error instanceof Error ? error.message : 'ошибка хранилища')); }
    } finally { locked.current = false; }
  }
  async function another() {
    try { await session.clear(); }
    catch (error) { setDraftNotice(error instanceof Error ? error.message : 'Не удалось удалить черновик'); return; }
    const values = { ...emptyForm(config), phone: getValues('phone') };
    submitted.current = false; lastQueued.current = JSON.stringify(draftFields(values));
    reset(values); setCreated(null); setDraftNotice('Новая заявка');
  }
  async function rememberPhone() {
    try { await phoneStore.save(getValues('phone')); setPhoneNotice('Телефон сохранён на устройстве'); }
    catch (error) { setPhoneNotice(error instanceof Error ? error.message : 'Телефон не сохранён'); }
  }
  async function forgetPhone() {
    try { await phoneStore.clear(); setValue('phone', ''); setPhoneNotice(Platform.OS === 'web' ? 'Поле телефона очищено. Браузер номер не сохранял.' : 'Сохранённый телефон удалён'); }
    catch (error) { setPhoneNotice(error instanceof Error ? error.message : 'Телефон не удалён'); }
  }
  const disabled = !ready || isSubmitting || Boolean(created);
  const category = observed.category;
  const detailLabel = config.number === 2 ? 'Инвентарный номер' : 'Цвет или модель';
  const showDetail = (config.number === 2 && category === 'books') || (config.number === 5 && category === 'electronics');
  const field = (name: TextFieldName, label: string, hint?: string) => <View style={s.field} key={name}>
    <Text style={s.label}>{label}</Text>
    <Controller control={control} name={name} render={({ field: { value, onChange, onBlur, ref } }) =>
      <TextInput ref={ref} style={[s.input, errors[name] && s.inputError]} value={value}
        onChangeText={onChange} onBlur={onBlur} editable={!disabled}
        accessibilityLabel={label} accessibilityHint={errors[name]?.message ?? hint}
        keyboardType={name === 'phone' ? 'phone-pad' : 'default'}
        autoCapitalize={name === 'phone' || name === 'foundAt' ? 'none' : 'sentences'} />
    } />
    {hint && <Text style={s.hint}>{hint}</Text>}
    {errors[name] && <Text style={s.error} accessibilityRole="alert">{errors[name]?.message}</Text>}
  </View>;

  return <ScrollView style={s.screen} keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
    <View style={s.card}>
      <Text style={s.title}>Сообщить о находке</Text>
      <Text style={s.subtitle}>{config.place}. Укажите, что найдено и где это хранится. Поля заявки проверяются перед отправкой.</Text>
      <Text style={s.hint}>Не указывайте номера банковских карт и документов. Контактный телефон не показывается в каталоге.</Text>
      <Text style={s.notice} accessibilityLiveRegion="polite">{draftNotice}</Text>
      {field('title', 'Название находки')}
      <View style={s.field}>
        <Text style={s.label}>Категория</Text>
        <Controller control={control} name="category" render={({ field: { value, onChange } }) => <View style={s.row}>
          {config.categories.map(c => <Pressable key={c.id} style={[s.choice, value === c.id && s.chosen]}
            disabled={disabled} onPress={() => onChange(c.id)} accessibilityRole="radio"
            accessibilityState={{ checked: value === c.id, disabled }} accessibilityLabel={c.label}>
            <Text style={s.label}>{value === c.id ? '● ' : '○ '}{c.label}</Text>
          </Pressable>)}
        </View>} />
        {errors.category && <Text style={s.error} accessibilityRole="alert">{errors.category.message}</Text>}
      </View>
      <DescriptionField control={control} errors={errors} disabled={disabled} />
      {field('extra', config.extraLabel, config.number === 4 ? `ЧЧ:ММ по учебным часам UTC+5. Сейчас ${campusClock().time}.` : undefined)}
      {field('foundAt', 'Дата находки', 'Формат ГГГГ-ММ-ДД, не позже сегодняшней даты по часам UTC+5.')}
      {showDetail && field('detail', detailLabel)}
      {config.number === 6 && category === 'documents' && <View style={s.field}>
        <View style={s.row}>
          <Controller control={control} name="handedToOffice" render={({ field: { value, onChange } }) =>
            <Switch value={value} onValueChange={onChange} disabled={disabled} accessibilityLabel="Документы переданы в деканат" />
          } />
          <Text style={s.label}>Документы переданы в деканат</Text>
        </View>
        {errors.handedToOffice && <Text style={s.error} accessibilityRole="alert">{errors.handedToOffice.message}</Text>}
      </View>}
      {field('phone', 'Контактный телефон', '+7 и ещё 10 цифр. Номер не входит в обычный черновик.')}
      {errors.root?.server && <Text style={s.error} accessibilityRole="alert">{errors.root.server.message}</Text>}
      {!created && <Pressable style={[s.button, disabled && s.disabled]} disabled={disabled}
        onPress={() => { clearErrors('root.server'); void handleSubmit(send)(); }} accessibilityRole="button">
        <Text style={s.buttonText}>{isSubmitting ? 'Отправляем…' : 'Отправить заявку'}</Text>
      </Pressable>}
      {created && <View style={s.field}>
        <Text style={s.label} accessibilityLiveRegion="polite">Заявка создана: {created.title}</Text>
        <Pressable style={s.button} accessibilityRole="button"
          onPress={() => router.push({ pathname: '/items/[id]', params: { id: created._id } })}>
          <Text style={s.buttonText}>Открыть находку</Text>
        </Pressable>
        <Pressable style={s.secondary} onPress={() => void another()} accessibilityRole="button"><Text style={s.secondaryText}>Другая заявка</Text></Pressable>
      </View>}
    </View>
    <View style={s.card}>
      <Text style={s.label}>Телефон на этом устройстве</Text>
      <Text style={s.hint}>{Platform.OS === 'web' ? 'В браузере номер не сохраняется. В приложении на телефоне для этого используется SecureStore.' : 'Номер сохраняется только по вашей команде. Его можно удалить отдельной кнопкой.'}</Text>
      <Pressable style={s.secondary} disabled={!ready || isSubmitting} onPress={() => void rememberPhone()} accessibilityRole="button"><Text style={s.secondaryText}>Запомнить телефон</Text></Pressable>
      <Pressable style={s.secondary} disabled={!ready || isSubmitting} onPress={() => void forgetPhone()} accessibilityRole="button"><Text style={s.secondaryText}>Удалить сохранённый телефон</Text></Pressable>
      {Boolean(phoneNotice) && <Text style={s.notice} accessibilityLiveRegion="polite">{phoneNotice}</Text>}
    </View>
  </ScrollView>;
}
