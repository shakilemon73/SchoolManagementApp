import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  date?: Date | undefined
  setDate?: (date: Date | undefined) => void
  className?: string
  disabled?: boolean
}

export function DatePicker({ 
  date, 
  setDate = () => {}, // Provide default empty function if not provided
  className, 
  disabled 
}: DatePickerProps) {
  const { t, currentLanguage } = useLanguage()

  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    
    if (currentLanguage === 'bn') {
      const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
      const day = date.getDate().toString().split('').map(d => bengaliNumerals[parseInt(d)]).join('')
      
      const bengaliMonths = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
      ]
      const month = bengaliMonths[date.getMonth()]
      
      const year = date.getFullYear().toString().split('').map(y => bengaliNumerals[parseInt(y)]).join('')
      
      return `${day} ${month}, ${year}`
    }
    
    if (currentLanguage === 'ar') {
      return new Intl.DateTimeFormat('ar-SA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date)
    }
    
    return format(date, "PPP")
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDate(date) : <span>"common.pickDate"</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}