
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://zuhfdlqxvxolubuztpws.supabase.co';
const supabaseKey = 'sb_publishable_t3XT8hmNKo3ZmD2lUWKvcQ_7hMJ12Vt';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Nome fixo do bucket para evitar erro "Bucket not found"
const ASSETS_BUCKET = 'produtos';

/**
 * Redimensiona uma imagem utilizando Canvas (ideal para logos)
 */
export async function redimensionarImagem(file: File, largura = 200, altura = 200): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = largura;
        canvas.height = altura;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Erro ao obter contexto do canvas');
        
        // Mantém a proporção ou preenche o quadrado
        ctx.fillStyle = "transparent";
        ctx.fillRect(0, 0, largura, altura);
        ctx.drawImage(img, 0, 0, largura, altura);
        
        canvas.toBlob((blob) => {
          if (!blob) return reject('Erro ao gerar blob');
          const resizedFile = new File([blob], file.name, { type: file.type });
          resolve(resizedFile);
        }, file.type);
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Realiza o upload de imagem para o Supabase Storage.
 * Utiliza um único bucket 'produtos' e organiza por pastas.
 */
export async function uploadImage(
  file: File, 
  pasta: string = 'produtos', 
  tipo: 'produto' | 'logo' | 'carrossel' = 'produto'
): Promise<string | null> {
  try {
    let arquivoUpload = file;

    // Se for logo, aplica o redimensionamento padrão
    if (tipo === 'logo') {
      arquivoUpload = await redimensionarImagem(file, 200, 200);
    }

    const fileExt = arquivoUpload.name.split('.').pop();
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomStr}.${fileExt}`;
    
    // Organização por pastas dentro do mesmo bucket: pasta/nome_do_arquivo
    const filePath = `${pasta}/${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from(ASSETS_BUCKET)
      .upload(filePath, arquivoUpload, { 
        upsert: true,
        contentType: arquivoUpload.type
      });

    if (uploadError) {
      console.error(`Erro no upload (${ASSETS_BUCKET}/${filePath}):`, uploadError.message);
      // Se o erro for Bucket not found, avisamos o usuário
      if (uploadError.message.includes('not found')) {
        alert(`Erro Crítico: O bucket '${ASSETS_BUCKET}' não existe no seu Supabase. Crie-o no painel Storage.`);
      }
      return null;
    }

    const { data: urlData } = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Erro inesperado no serviço de upload:', error);
    return null;
  }
}
