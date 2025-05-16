"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn(
      className
    )}
    {...props}
  />
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "w-full flex px-2 bg-gray-50 rounded-none border-b border-gray-200 h-12 justify-between items-center gap-2",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    color?: "blue" | "amber" | "green" | "red" | "purple";
  }
>(({ className, color = "blue", ...props }, ref) => {
  const colorStyles = {
    blue: "data-[state=active]:border-blue-500",
    amber: "data-[state=active]:border-amber-500",
    green: "data-[state=active]:border-green-500",
    red: "data-[state=active]:border-red-500",
    purple: "data-[state=active]:border-purple-500",
  }

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex-1 rounded-none h-full data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:shadow-none transition-all",
        colorStyles[color],
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-0 pt-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
