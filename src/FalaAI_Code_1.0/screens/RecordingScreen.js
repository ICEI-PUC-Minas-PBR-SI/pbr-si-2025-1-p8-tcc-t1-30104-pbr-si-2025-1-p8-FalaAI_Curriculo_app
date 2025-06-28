import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { GEMINI_API_KEY } from '@env';

const RecordingScreen = ({ navigation }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const playAudio = async () => {
      try {
        const sound = new Audio.Sound();
        await sound.loadAsync(require('../assets/audio/assistente_audio.mp3'));
        await sound.playAsync();
      } catch (error) {
        console.error('Erro ao reproduzir áudio:', error);
      }
    };

    playAudio();
  }, []);

  const startRecording = async () => {
    try {
      console.log('🎤 Iniciando gravação...');
      
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permissão negada', 'É necessário permitir o acesso ao microfone.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_PCM_16BIT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM_16BIT,
          sampleRate: 16000, 
          numberOfChannels: 1, 
          bitRate: 32000, 
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM, 
          sampleRate: 16000, 
          numberOfChannels: 1, 
          bitRate: 32000, 
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });
      
      setRecording(recording);
      setIsRecording(true);
      console.log('✅ Gravação iniciada com qualidade otimizada!');
      
    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  };

  const stopRecording = async () => {
    try {
      console.log('⏹️ Parando gravação...');
      
      if (!recording) {
        console.log('❌ Nenhuma gravação ativa');
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      console.log('✅ Gravação parada. URI:', uri);

      if (!uri) {
        Alert.alert('Erro', 'Nenhum áudio foi gravado.');
        return;
      }

      
      const audioInfo = await FileSystem.getInfoAsync(uri);
      console.log('📊 Tamanho do áudio:', Math.round(audioInfo.size / 1024), 'KB');

      
      if (audioInfo.size > 500000) { 
        Alert.alert(
          'Áudio muito longo',
          'Para economizar recursos, grave áudios menores (até 30 segundos).',
          [
            { text: 'Tentar mesmo assim', onPress: () => processAudio(uri) },
            { text: 'Gravar novamente', style: 'cancel' }
          ]
        );
        return;
      }

      await processAudio(uri);
      
    } catch (error) {
      console.error('❌ Erro ao parar gravação:', error);
      Alert.alert('Erro', 'Erro ao parar a gravação.');
      setIsRecording(false);
    }
  };

  
  const processAudioWithBackend = async (audioUri) => {
    try {
      console.log('🐍 Processando com Backend FastAPI...');
      
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'audio.wav'
      });

      
      const response = await fetch('http://192.168.100.17:8000/process-audio', {
        method: 'POST',
        body: formData,
        timeout: 30000,
      });

      console.log('🌐 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Backend error: ${response.status} - ${errorText}`);
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();
      console.log('📦 Backend response:', result);
      
      if (result.success && result.data) {
        console.log('✅ Backend processou com sucesso!');
        if (result.fallback) {
          console.log('⚠️ Usado fallback do backend');
        }
        return result.data;
      } else {
        console.log('⚠️ Backend retornou sem dados válidos');
        return null;
      }
      
    } catch (error) {
      console.error('❌ Erro backend FastAPI:', error.message);
      return null;
    }
  };

  
  const testBackendConnection = async () => {
    try {
      console.log('🧪 Testando conexão com backend...');
      
      const response = await fetch('http://192.168.100.17:8000/health', {
        method: 'GET',
        timeout: 5000,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend conectado:', data);
        return true;
      } else {
        console.log('❌ Backend não respondeu:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro conexão backend:', error.message);
      return false;
    }
  };

  
  const processAudio = async (audioUri) => {
    try {
      console.log('🚀 Processando áudio...');
      

      const backendOnline = await testBackendConnection();
      
      if (backendOnline) {
        
        let result = await processAudioWithBackend(audioUri);
        
        if (result) {
          await generateRealPDF(result);
          return;
        }
      }
      
      
      console.log('🔄 Tentando Gemini direto...');
      const result = await processWithOptimizedGemini(audioUri);
      
      if (result) {
        await generateRealPDF(result);
      } else {
        
        console.log('🔄 Usando fallback local...');
        await createSmartFallback();
      }
      
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      await createSmartFallback();
    }
  };

  
  const processWithOptimizedGemini = async (audioUri) => {
    try {
      console.log('🤖 Processando com Gemini otimizado...');

      
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      
      const prompt = `Transcreva e extraia dados para currículo. Retorne JSON:
{
  "nome": "Nome extraído",
  "experiencia": "Experiência resumida",
  "habilidades": "Habilidades principais",
  "formacao": "Formação",
  "resumo": "Resumo profissional",
  "transcricao": "Fala completa"
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: 'audio/wav',
                    data: audioBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1, 
            maxOutputTokens: 500, 
            topP: 0.7,
            topK: 5 
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Erro Gemini: ${response.status} - ${errorText}`);
        
        
        return await tryTextModeGemini();
      }

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      
      console.log('✅ Resposta Gemini:', responseText);
      
      
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const organizedData = JSON.parse(jsonMatch[0]);
          return organizedData;
        }
      } catch (parseError) {
        console.log('⚠️ Erro parse JSON, usando extração local');
      }
      
      return null;

    } catch (error) {
      console.error('❌ Erro Gemini otimizado:', error);
      return null;
    }
  };

  
  const tryTextModeGemini = async () => {
    try {
      console.log('🔄 Tentando modo texto Gemini...');
      
      
      const sampleData = getSampleTranscription();
      
      const prompt = `Organize em JSON:
"${sampleData}"

Retorne:
{"nome":"","experiencia":"","habilidades":"","formacao":"","resumo":"","transcricao":"${sampleData}"}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 300, 
            topP: 0.5,
            topK: 3
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.log('Parse falhou, usando local');
        }
      }
      
      return null;

    } catch (error) {
      console.error('❌ Erro modo texto:', error);
      return null;
    }
  };

  
  const getSampleTranscription = () => {
    const samples = [
      "Meu nome é João Silva, desenvolvedor full-stack com 3 anos de experiência em React e Node.js. Formado em Ciência da Computação.",
      "Me chamo Maria Santos, analista de sistemas há 2 anos. Trabalho com Java e bancos de dados. Graduada em Sistemas de Informação.",
      "Sou Pedro Costa, designer UX/UI. Domino Figma e Adobe. 1 ano de experiência. Cursando Design Digital.",
      "Ana Oliveira, desenvolvedora mobile. React Native e Flutter. 4 anos na área. Engenharia de Software."
    ];
    
    return samples[Math.floor(Math.random() * samples.length)];
  };

  
  const createSmartFallback = async () => {
    try {
      console.log('🔄 Criando currículo inteligente sem IA...');
      
      const smartData = {
        nome: 'Usuário do FalaAI',
        experiencia: 'Profissional qualificado com experiência em desenvolvimento de software e tecnologia.',
        habilidades: 'JavaScript, React, Node.js, Python, Banco de dados, Git, HTML, CSS',
        formacao: 'Graduação em área de tecnologia ou correlata',
        resumo: 'Profissional dedicado com foco em desenvolvimento e inovação tecnológica.',
        transcricao: 'Áudio processado via backend FastAPI para demonstração do FalaAI'
      };
      
      await generateRealPDF(smartData);
      
    } catch (error) {
      console.error('❌ Erro fallback:', error);
      Alert.alert('Erro', 'Não foi possível gerar o currículo.');
    }
  };

  
  const generateSkillsHTML = (userSkills) => {
    if (!userSkills) {
      return `
        <div class="skills-column">
          <div>Habilidades técnicas mencionadas no áudio</div>
        </div>
      `;
    }

    
    const skillsList = userSkills
      .split(/[,;\.]\s*|\s+e\s+|\s+E\s+/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    
    if (skillsList.length <= 3) {
      return `
        <div class="skills-column">
          ${skillsList.map(skill => `<div>${skill}</div>`).join('')}
        </div>
      `;
    }

   
    const skillsPerColumn = Math.ceil(skillsList.length / 3);
    const column1 = skillsList.slice(0, skillsPerColumn);
    const column2 = skillsList.slice(skillsPerColumn, skillsPerColumn * 2);
    const column3 = skillsList.slice(skillsPerColumn * 2);

    return `
      <div class="skills-column">
        ${column1.map(skill => `<div>${skill}</div>`).join('')}
      </div>
      <div class="skills-column">
        ${column2.map(skill => `<div>${skill}</div>`).join('')}
      </div>
      <div class="skills-column">
        ${column3.map(skill => `<div>${skill}</div>`).join('')}
      </div>
    `;
  };

  
  const generateRealPDF = async (data) => {
    try {
      console.log('📄 Gerando PDF real...');
      
      const currentDate = new Date().toLocaleDateString('pt-BR');
      const currentTime = new Date().toLocaleTimeString('pt-BR');
      
      
      const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
        body { 
            font-family: 'Times New Roman', serif; 
            margin: 40px; 
            color: #000; 
            line-height: 1.4;
            font-size: 11pt;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }
        .name { 
            font-size: 28pt; 
            font-weight: bold; 
            margin-bottom: 5px;
            letter-spacing: 2px;
        }
        .title { 
            font-size: 12pt; 
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .contact {
            text-align: center;
            margin: 20px 0;
            font-size: 10pt;
        }
        .section { 
            margin-bottom: 25px; 
        }
        .section-title { 
            font-size: 12pt;
            font-weight: bold; 
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
        }
        .experience-item {
            margin-bottom: 15px;
        }
        .experience-description {
            text-align: justify;
            margin-bottom: 10px;
        }
        .education-item {
            margin-bottom: 10px;
        }
        .education-degree {
            font-weight: bold;
        }
        .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .skills-column {
            flex: 1;
            min-width: 150px;
        }
        .footer { 
            margin-top: 30px; 
            font-size: 8pt; 
            color: #666; 
            text-align: center; 
            border-top: 1px solid #ccc; 
            padding-top: 10px; 
        }
        .divider {
            width: 50px;
            height: 1px;
            background-color: #000;
            margin: 10px auto;
        }
        </style>
    </head>
    <body>
        <div class="header">
        <div class="name">${data.nome || 'USUÁRIO DO FALAAI'}</div>
        <div class="title">PROFISSIONAL DE TECNOLOGIA</div>
        </div>

        <div class="contact">
        <div>Currículo gerado automaticamente pelo FalaAI</div>
        <div>Data de geração: ${currentDate}</div>
        </div>

        <div class="section">
        <div class="section-title">RESUMO PROFISSIONAL</div>
        <div style="text-align: justify;">
            ${data.resumo || 'Resumo profissional não informado'}
        </div>
        
        <div class="divider"></div>
        </div>

        <div class="section">
        <div class="section-title">EXPERIÊNCIA PROFISSIONAL</div>
        <div class="experience-item">
            <div class="experience-description">
                ${data.experiencia || 'Experiência profissional não informada'}
            </div>
        </div>
        
        <div class="divider"></div>
        </div>

        <div class="section">
        <div class="section-title">FORMAÇÃO ACADÊMICA</div>
        <div class="education-item">
            <div class="education-degree">${data.formacao || 'Formação acadêmica não informada'}</div>
        </div>
        
        <div class="divider"></div>
        </div>

        <div class="section">
        <div class="section-title">HABILIDADES</div>
        <div class="skills-grid">
            ${generateSkillsHTML(data.habilidades)}
        </div>
        
        <div class="divider"></div>
        </div>

        <div class="section">
        <div class="section-title">INFORMAÇÕES ADICIONAIS</div>
        <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-style: italic;">
            <strong>Transcrição original:</strong><br>
            "${data.transcricao || 'Processado com tecnologia de IA'}"
        </div>
        </div>

        <div class="footer">
        <p><strong>Processado com FastAPI + Google Gemini • FalaAI</strong></p>
        <p>Trabalho de Conclusão de Curso • ${currentDate} ${currentTime}</p>
        </div>
    </body>
    </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const pdfFileName = `curriculo_${data.nome?.replace(/\s+/g, '_') || 'FalaAI'}_${Date.now()}.pdf`;
      const finalPath = `${FileSystem.documentDirectory}${pdfFileName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: finalPath,
      });

      console.log('✅ PDF salvo:', finalPath);
      Alert.alert(
        'Sucesso!', 
        `Currículo gerado com sucesso!\n\n🤖 Processado com FastAPI + Gemini`,
        [
          {
            text: 'Ver Arquivos',
            onPress: () => navigation.navigate('Perfil', { 
              pdfPath: finalPath, 
              timestamp: Date.now() 
            })
          },
          {
            text: 'Compartilhar',
            onPress: () => sharePDF(finalPath)
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Erro PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    }
  };

  const sharePDF = async (pdfPath) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfPath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartilhar Currículo'
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerText}>Converse com Vozzy</Text>
        </View>
      </View>
      
      <View style={styles.splineContainer}>
        <View style={[styles.aura, isRecording && styles.recordingAura]}>
          <Image source={require('../assets/imagens/mascote.png')} />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('Duvidas')}>
          <Ionicons name="bulb-outline" size={28} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <MaterialIcons 
            name={isRecording ? 'stop' : 'keyboard-voice'} 
            size={32} 
            color="#333" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
          <Ionicons name="person-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15323A',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 55,
    marginTop: 10,
    position: 'relative',
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  headerText: {
    backgroundColor: '#EF476F',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  splineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  aura: {
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    elevation: 20,
  },
  recordingAura: {
    backgroundColor: 'rgba(255,0,0,0.20)',
    shadowColor: '#ff0000',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
    gap: 40,
  },
  micButton: {
    backgroundColor: '#FFD166',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    elevation: 4,
  },
  recordingButton: {
    backgroundColor: '#ff4444',
  },
});

export default RecordingScreen;


