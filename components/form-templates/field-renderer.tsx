'use client'

import { useState } from 'react'
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

// Common country dial codes
const COUNTRY_CODES = [
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'NZ', name: 'New Zealand', dial: '+64' },
  { code: 'IE', name: 'Ireland', dial: '+353' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'ES', name: 'Spain', dial: '+34' },
  { code: 'IT', name: 'Italy', dial: '+39' },
  { code: 'NL', name: 'Netherlands', dial: '+31' },
  { code: 'BE', name: 'Belgium', dial: '+32' },
  { code: 'CH', name: 'Switzerland', dial: '+41' },
  { code: 'AT', name: 'Austria', dial: '+43' },
  { code: 'SE', name: 'Sweden', dial: '+46' },
  { code: 'NO', name: 'Norway', dial: '+47' },
  { code: 'DK', name: 'Denmark', dial: '+45' },
  { code: 'FI', name: 'Finland', dial: '+358' },
  { code: 'PL', name: 'Poland', dial: '+48' },
  { code: 'PT', name: 'Portugal', dial: '+351' },
  { code: 'MX', name: 'Mexico', dial: '+52' },
  { code: 'BR', name: 'Brazil', dial: '+55' },
  { code: 'AR', name: 'Argentina', dial: '+54' },
  { code: 'CO', name: 'Colombia', dial: '+57' },
  { code: 'JP', name: 'Japan', dial: '+81' },
  { code: 'CN', name: 'China', dial: '+86' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'KR', name: 'South Korea', dial: '+82' },
  { code: 'SG', name: 'Singapore', dial: '+65' },
  { code: 'HK', name: 'Hong Kong', dial: '+852' },
  { code: 'AE', name: 'UAE', dial: '+971' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { code: 'TR', name: 'Turkey', dial: '+90' },
  { code: 'ZA', name: 'South Africa', dial: '+27' },
  { code: 'NG', name: 'Nigeria', dial: '+234' },
  { code: 'EG', name: 'Egypt', dial: '+20' },
  { code: 'RU', name: 'Russia', dial: '+7' },
  { code: 'UA', name: 'Ukraine', dial: '+380' },
  { code: 'GR', name: 'Greece', dial: '+30' },
]

function getDefaultDial(phoneCountry?: string): string {
  if (!phoneCountry) return '+1'
  return COUNTRY_CODES.find(c => c.code === phoneCountry)?.dial ?? '+1'
}

export function FieldRenderer({ field, register, errors, inputClassName = '', labelClassName = '' }: Props) {
  const baseInput = `w-full px-4 py-3 rounded-lg text-sm outline-none transition-all ${inputClassName}`
  const error = errors[field.id]

  // Phone prefix state
  const [phonePrefix, setPhonePrefix] = useState(getDefaultDial(field.phoneCountry))
  const [phoneNumber, setPhoneNumber] = useState('')

  const visibleCountries = field.phoneCountry
    ? COUNTRY_CODES.filter(c => c.code === field.phoneCountry)
    : COUNTRY_CODES

  if (field.type === 'phone') {
    const { onChange: rhfOnChange, ref, onBlur, name } = register(field.id, {
      required: field.required && `${field.label} is required`,
    })

    function handlePrefixChange(dial: string) {
      setPhonePrefix(dial)
      const combined = phoneNumber ? `${dial} ${phoneNumber}` : ''
      rhfOnChange({ type: 'change', target: { name, value: combined } } as React.ChangeEvent<HTMLInputElement>)
    }

    function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
      const num = e.target.value
      setPhoneNumber(num)
      const combined = num ? `${phonePrefix} ${num}` : ''
      rhfOnChange({ type: 'change', target: { name, value: combined } } as React.ChangeEvent<HTMLInputElement>)
    }

    return (
      <div className="space-y-1.5">
        <label className={`block text-sm font-medium ${labelClassName}`}>
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <div className="flex">
          <select
            value={phonePrefix}
            onChange={e => handlePrefixChange(e.target.value)}
            disabled={!!field.phoneCountry}
            className={`shrink-0 px-2 py-3 rounded-l-lg text-sm border-r-0 outline-none transition-all ${inputClassName} rounded-r-none`}
            style={{ width: field.phoneCountry ? '72px' : '96px' }}
            aria-label="Country code"
          >
            {visibleCountries.map(c => (
              <option key={`${c.code}-${c.dial}`} value={c.dial}>
                {c.dial} {c.name}
              </option>
            ))}
          </select>
          <input
            ref={ref}
            name={name}
            onBlur={onBlur}
            type="tel"
            value={phoneNumber}
            onChange={handleNumberChange}
            placeholder={field.placeholder ?? '555-0100'}
            className={`${baseInput} rounded-l-none`}
          />
        </div>
        {error && (
          <p className="text-red-400 text-xs">{error.message as string}</p>
        )}
      </div>
    )
  }

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
          type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
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
