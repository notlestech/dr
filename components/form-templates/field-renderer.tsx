'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { FormField } from '@/types/app'

interface Props {
  field: FormField
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  errors: FieldErrors
  inputClassName?: string
  labelClassName?: string
}

export function FieldRenderer({ field, register, errors, inputClassName = '', labelClassName = '' }: Props) {
  const baseInput = `w-full px-4 py-3 rounded-lg text-sm outline-none transition-all ${inputClassName}`
  const error = errors[field.id]

  return (
    <div className="space-y-1.5">
      <label className={`block text-sm font-medium ${labelClassName}`}>
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {field.type === 'dropdown' ? (
        <select
          {...register(field.id, { required: field.required && `${field.label} is required` })}
          className={baseInput}
        >
          <option value="">{field.placeholder || 'Select an option'}</option>
          {(field.options ?? []).map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : field.type === 'checkbox' ? (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register(field.id, { required: field.required && `${field.label} is required` })}
            className="w-4 h-4 accent-indigo-600"
          />
          <span className={`text-sm ${labelClassName}`}>{field.placeholder || field.label}</span>
        </div>
      ) : (
        <input
          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
          placeholder={field.placeholder}
          {...register(field.id, {
            required: field.required && `${field.label} is required`,
            ...(field.type === 'email' && { pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }),
          })}
          className={baseInput}
        />
      )}

      {error && (
        <p className="text-red-400 text-xs">{error.message as string}</p>
      )}
    </div>
  )
}
