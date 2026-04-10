'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, X, Lock, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FormWizardValues } from '@/lib/validations/form'

interface Props {
  values: FormWizardValues
  update: (payload: Partial<FormWizardValues>) => void
  isPro: boolean
}

export function StepBranding({ values, update, isPro }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}.${ext}`

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (error) {
        toast.error('Upload failed — make sure the logos bucket exists in Supabase Storage')
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(data.path)
      update({ logo_url: publicUrl })
      toast.success('Logo uploaded')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeLogo() {
    update({ logo_url: '' })
  }

  return (
    <div className="space-y-10">
      {/* Logo upload */}
      <div className="space-y-3">
        <Label>Logo</Label>
        <p className="text-sm text-muted-foreground -mt-1">
          Shown at the top of your public entry form. PNG or SVG recommended.
        </p>

        {values.logo_url ? (
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-xl border bg-muted flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={values.logo_url}
                alt="Logo preview"
                className="max-w-full max-h-full object-contain p-2"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Logo uploaded</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="gap-1.5"
                >
                  <Upload className="size-3.5" />
                  Replace
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeLogo}
                  className="text-muted-foreground gap-1.5"
                >
                  <X className="size-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <label
            className={cn(
              'flex flex-col items-center justify-center gap-3 w-full h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
              uploading
                ? 'border-border opacity-50 pointer-events-none'
                : 'border-border hover:border-foreground/40 hover:bg-muted/20'
            )}
          >
            <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
              {uploading ? (
                <div className="size-5 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
              ) : (
                <ImageIcon className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{uploading ? 'Uploading…' : 'Click to upload logo'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, SVG — max 2 MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </label>
        )}

        {/* Hidden input for replace */}
        {values.logo_url && (
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
        )}
      </div>

      {/* Subdomain */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="subdomain">
            Custom URL
          </Label>
          {!isPro && (
            <span className="flex items-center gap-0.5 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full border font-medium">
              <Lock className="size-2.5" /> Pro
            </span>
          )}
        </div>

        {isPro ? (
          <>
            <div className="flex items-center">
              <Input
                id="subdomain"
                value={values.subdomain}
                onChange={e => update({ subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="my-giveaway"
                className="rounded-r-none border-r-0 font-mono"
              />
              <span className="h-10 px-3 flex items-center bg-muted border border-input text-muted-foreground text-sm rounded-r-xl whitespace-nowrap">
                .drawvault.site
              </span>
            </div>
            {values.subdomain && (
              <p className="text-xs text-muted-foreground">
                Public link:{' '}
                <span className="font-mono text-foreground">{values.subdomain}.drawvault.site</span>
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center rounded-xl border bg-muted/30 px-3 py-2.5 opacity-70">
            <span className="font-mono text-sm text-muted-foreground flex-1">{values.subdomain || 'auto-generated'}</span>
            <span className="text-sm text-muted-foreground">.drawvault.site</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {isPro
            ? 'Choose a memorable URL slug for your form.'
            : 'Your URL is auto-generated from the form name. Upgrade to Pro to customize it.'}
        </p>
      </div>
    </div>
  )
}
