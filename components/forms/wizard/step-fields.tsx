'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Plus, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { FormWizardValues } from '@/lib/validations/form'
import type { FormField, FieldType } from '@/types/app'

interface Props {
  values: FormWizardValues
  update: (payload: Partial<FormWizardValues>) => void
  isPro?: boolean
}

const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: 'text',     label: 'Short text',  icon: 'Aa' },
  { type: 'phone',    label: 'Phone',       icon: 'Tel' },
  { type: 'number',   label: 'Number',      icon: '#' },
  { type: 'dropdown', label: 'Dropdown',    icon: '▾' },
  { type: 'checkbox', label: 'Checkbox',    icon: '✓' },
]

// Free tier limit
const FREE_FIELD_LIMIT = 3

function SortableField({
  field,
  isEmail,
  onUpdate,
  onRemove,
}: {
  field: FormField
  isEmail: boolean
  onUpdate: (updates: Partial<FormField>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={cn(
      'rounded-xl border bg-card p-4 transition-colors',
      isDragging && 'shadow-2xl'
    )}>
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          disabled={isEmail}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize border">
              {field.type}
            </span>
            {isEmail && <span className="text-xs text-muted-foreground">(required)</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs mb-1 block">Label</Label>
              <Input
                value={field.label}
                onChange={e => onUpdate({ label: e.target.value })}
                placeholder="Field label"
                disabled={isEmail}
                className="text-sm h-8"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs mb-1 block">Placeholder</Label>
              <Input
                value={field.placeholder ?? ''}
                onChange={e => onUpdate({ placeholder: e.target.value })}
                placeholder="Optional hint..."
                disabled={isEmail}
                className="text-sm h-8"
              />
            </div>
          </div>

          {/* Dropdown options */}
          {field.type === 'dropdown' && (
            <div>
              <Label className="text-muted-foreground text-xs mb-1 block">Options (one per line)</Label>
              <textarea
                value={(field.options ?? []).join('\n')}
                onChange={e => onUpdate({ options: e.target.value.split('\n').filter(Boolean) })}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={3}
                className="w-full bg-background border border-input rounded-lg text-foreground text-sm px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          )}
        </div>

        {/* Required toggle + delete */}
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={onRemove}
            disabled={isEmail}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUpdate({ required: !field.required })}
            disabled={isEmail}
            className={cn(
              'text-xs px-2 py-0.5 rounded transition-colors',
              field.required
                ? 'bg-foreground/10 text-foreground border border-foreground/20'
                : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
            )}
          >
            {field.required ? 'Required' : 'Optional'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function StepFields({ values, update, isPro }: Props) {
  const atFieldLimit = !isPro && values.fields.length >= FREE_FIELD_LIMIT
  const [showPicker, setShowPicker] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = values.fields.findIndex(f => f.id === active.id)
    const newIndex = values.fields.findIndex(f => f.id === over.id)
    update({ fields: arrayMove(values.fields, oldIndex, newIndex) })
  }

  function addField(type: FieldType) {
    const newField: FormField = {
      id: `${type}_${Date.now()}`,
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      placeholder: '',
      required: false,
    }
    update({ fields: [...values.fields, newField] })
    setShowPicker(false)
  }

  function updateField(id: string, updates: Partial<FormField>) {
    update({ fields: values.fields.map(f => f.id === id ? { ...f, ...updates } : f) })
  }

  function removeField(id: string) {
    update({ fields: values.fields.filter(f => f.id !== id) })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Drag to reorder. The email field is always required.</p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={values.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {values.fields.map(field => (
              <SortableField
                key={field.id}
                field={field}
                isEmail={field.type === 'email' && field.id === values.fields[0]?.id}
                onUpdate={updates => updateField(field.id, updates)}
                onRemove={() => removeField(field.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add field */}
      <div>
        {showPicker ? (
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-3">Select field type</p>
            <div className="flex flex-wrap gap-2">
              {FIELD_TYPES.map(ft => (
                <button
                  key={ft.type}
                  onClick={() => addField(ft.type)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-accent text-foreground text-sm transition-colors"
                >
                  <span className="text-base">{ft.icon}</span>
                  {ft.label}
                </button>
              ))}
              <button onClick={() => setShowPicker(false)} className="px-3 py-2 text-muted-foreground hover:text-foreground text-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed gap-2"
            onClick={() => setShowPicker(true)}
            disabled={atFieldLimit}
          >
            {atFieldLimit ? (
              <><Lock className="w-4 h-4" /> Field limit reached — upgrade to Pro</>
            ) : (
              <><Plus className="w-4 h-4" /> Add field</>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
