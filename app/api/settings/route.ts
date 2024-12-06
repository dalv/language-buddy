import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.from('app_settings').select('*')
    
    if (error) throw error

    const settingsObject = data.reduce((acc, setting) => {
      acc[setting.name] = setting.value
      return acc
    }, {} as { [key: string]: string })

    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, value } = await req.json()

    const { error } = await supabase
      .from('app_settings')
      .update({ value: value })
      .eq('name', name)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}

