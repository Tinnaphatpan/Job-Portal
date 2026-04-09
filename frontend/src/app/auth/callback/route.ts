import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !session) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const params = new URLSearchParams({
    email: session.user.email ?? '',
    name: session.user.user_metadata?.full_name ?? session.user.email ?? '',
    provider_id: session.user.id,
    avatar: session.user.user_metadata?.avatar_url ?? '',
  });

  return NextResponse.redirect(`${origin}/google-callback?${params.toString()}`);
}
