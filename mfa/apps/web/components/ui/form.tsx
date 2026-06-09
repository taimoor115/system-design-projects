"use client"

import React from "react"
import { FormProvider, useController } from "react-hook-form"

export function Form<T>({ children, ...props }: any) {
  return <FormProvider {...props}>{children}</FormProvider>
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function FormItem({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function FormField({ control, name, render }: any) {
  const { field } = useController({ name, control })
  return <>{render({ field })}</>
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
  return <p className="text-sm text-red-500">{children}</p>
}

export default null
