import QRCode from 'qrcode';
// import { getAllExercises } from '../src/server/service/exercise';
import fs from 'fs';
import path from 'path';

// Configurações
const QR_CODE_DIR = './public/qrcodes';
const BASE_URL = 'https://gymar.app/ar'; // Substitua pela sua URL de produção

// Função para garantir que o diretório existe
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Diretório criado: ${dirPath}`);
  }
}

// Função para gerar QR code para um exercício
async function generateQRCodeForExercise(slug: string, exerciseName: string) {
  try {
    const url = `${BASE_URL}/${slug}`;
    const fileName = `${slug}.png`;
    const filePath = path.join(QR_CODE_DIR, fileName);
    
    // Opções do QR code
    const options = {
      errorCorrectionLevel: 'M' as const,
      type: 'png' as const,
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    };

    await QRCode.toFile(filePath, url, options);
    console.log(`✅ QR Code gerado para "${exerciseName}": ${fileName}`);
    return { success: true, fileName, url };
  } catch (error) {
    console.error(`❌ Erro ao gerar QR code para "${exerciseName}":`, error);
    return { success: false, error };
  }
}

// Função principal para gerar todos os QR codes
async function generateAllQRCodes() {
  try {
    console.log('🚀 Iniciando geração de QR codes para exercícios...\n');
    
    // Garantir que o diretório existe
    ensureDirectoryExists(QR_CODE_DIR);
    
    // Buscar todos os exercícios do banco
    const exercicios = await getAllExercises();
    
    if (exercicios.length === 0) {
      console.log('⚠️ Nenhum exercício encontrado no banco de dados.');
      return;
    }
    
    console.log(`📋 Encontrados ${exercicios.length} exercícios para processar:\n`);
    
    const results = [];
    
    // Gerar QR code para cada exercício
    for (const exercicio of exercicios) {
      const result = await generateQRCodeForExercise(exercicio.slug, exercicio.name);
      results.push({
        exercicio: exercicio.name,
        slug: exercicio.slug,
        ...result
      });
    }
    
    // Relatório final
    const sucessos = results.filter(r => r.success).length;
    const erros = results.filter(r => !r.success).length;
    
    console.log(`\n📊 RELATÓRIO FINAL:`);
    console.log(`✅ QR codes gerados com sucesso: ${sucessos}`);
    console.log(`❌ Erros: ${erros}`);
    console.log(`📁 QR codes salvos em: ${QR_CODE_DIR}`);
    
    if (sucessos > 0) {
      console.log(`\n🌐 URLs geradas:`);
      results.filter(r => r.success).forEach(r => {
        console.log(`   • ${r.exercicio}: ${BASE_URL}/${r.slug}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral ao gerar QR codes:', error);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  generateAllQRCodes()
    .then(() => {
      console.log('\n🎉 Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

export { generateQRCodeForExercise, generateAllQRCodes };
