"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// AlertDialog wraps Dialog with confirmation-specific semantics.
// The API mirrors the shadcn/ui AlertDialog so consumers can use it identically.

const AlertDialog = Dialog
const AlertDialogTrigger = DialogTrigger

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent showCloseButton={false} className={cn("max-w-sm", className)} {...props}>
      {children}
    </DialogContent>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <DialogHeader className={cn("text-left", className)} {...props} />
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <DialogFooter className={cn("sm:justify-end", className)} {...props} />
}

const AlertDialogTitle = DialogTitle

const AlertDialogDescription = DialogDescription

function AlertDialogAction({
  className,
  onClick,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { onClick?: React.MouseEventHandler<HTMLButtonElement> }) {
  return (
    <Button className={className} onClick={onClick} {...props}>
      {children}
    </Button>
  )
}

function AlertDialogCancel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="outline" className={className} {...props}>
      {children}
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
