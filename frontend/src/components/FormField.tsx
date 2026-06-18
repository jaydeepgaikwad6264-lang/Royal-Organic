'use client'
import React from 'react'

type Props = {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
}

export default function FormField({ id, label, type = 'text', value, onChange, required, placeholder }: Props) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm text-royal-muted">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="border border-royal-sand rounded-md px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-royal-green/40"
      />
    </div>
  )
}
