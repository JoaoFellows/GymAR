import { NextRequest, NextResponse } from 'next/server';
import { cleanOrphanedQRCodes } from '@/server/service/exercise';

export async function DELETE(request: NextRequest) {
  try {
    const result = await cleanOrphanedQRCodes();
    
    return NextResponse.json({
      message: 'Limpeza de QR codes concluída',
      cleaned: result.cleaned,
      errors: result.errors
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao limpar QR codes órfãos' },
      { status: 500 }
    );
  }
}
