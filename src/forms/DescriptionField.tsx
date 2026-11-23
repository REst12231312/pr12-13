import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';
import type { ItemFormValues } from './itemSchema.ts';
import { formStyles as s } from './formStyles.ts';
export function DescriptionField({ control, errors, disabled }: {
  control: Control<ItemFormValues>; errors: FieldErrors<ItemFormValues>; disabled: boolean;
}) {
  // P04-FORM: свяжите description с Controller и TextInput по примеру поля title.
  // (Выполнено: четыре связи value/onChangeText/onBlur/ref, multiline, подпись, ошибка с role=alert.)
  const message = errors.description?.message;
  return <View style={s.field}>
    <Text style={s.label}>Описание</Text>
    <Controller control={control} name="description" render={({ field: { value, onChange, onBlur, ref } }) =>
      <TextInput ref={ref} style={[s.input, s.multiline, errors.description && s.inputError]}
        value={value} onChangeText={onChange} onBlur={onBlur}
        multiline editable={!disabled}
        accessibilityLabel="Описание" accessibilityHint={message} />
    } />
    {message && <Text style={s.error} accessibilityRole="alert">{message}</Text>}
  </View>;
}
