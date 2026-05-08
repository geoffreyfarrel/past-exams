/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ session: null });
}
