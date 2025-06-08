import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://spircnxyoqjeqctmqkmx.supabase.co'; // замените на ваш URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaXJjbnh5b3FqZXFjdG1xa214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzUzMjUsImV4cCI6MjA2NDg1MTMyNX0.4XYfSBcolMZfSyh63WSJuxQiYQ6LBhiRvrLhQxLw3Lo'; // замените на ваш ключ

export const supabase = createClient(supabaseUrl, supabaseAnonKey);