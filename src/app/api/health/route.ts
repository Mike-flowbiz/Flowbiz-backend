import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'FlowBiz API is running',
    timestamp: new Date().toISOString(),
  });
}
