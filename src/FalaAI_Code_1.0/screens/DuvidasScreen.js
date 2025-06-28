import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DuvidasScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Topo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerText}>Dicas</Text>
        </View>
      </View>

      {/* Dicas */}
      <View style={styles.tipsContainer}>
        <View style={[styles.tipBox, styles.yellow]}>
          <Text style={styles.tipTitle}>1. Prepare o ambiente</Text>
          <Text style={styles.tipText}>
            Procure um lugar silencioso para evitar que ruídos atrapalhem a transcrição da sua voz.
          </Text>
        </View>
        <View style={[styles.tipBox, styles.pink]}>
          <Text style={styles.tipTitlePink}>2. Fale com clareza</Text>
          <Text style={styles.tipText}>
            Fale devagar e articule bem as palavras para melhorar o reconhecimento de voz.
          </Text>
        </View>
        <View style={[styles.tipBox, styles.yellow]}>
          <Text style={styles.tipTitle}>3. Seja objetivo</Text>
          <Text style={styles.tipText}>
            Formule respostas diretas e completas para obter respostas mais precisas.
          </Text>
        </View>
        <View style={[styles.tipBox, styles.pink]}>
          <Text style={styles.tipTitlePink}>4. Revise</Text>
          <Text style={styles.tipText}>
            Você pode repetir ou ajustar a pergunta caso não tenha o resultado esperado.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15323A',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 10,
  },
  backButton: {
    marginRight: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginRight: 38, 
  },
  headerText: {
    backgroundColor: '#D35474',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    paddingHorizontal: 32,
    paddingVertical: 6,
    borderRadius: 8,
    fontStyle: 'italic',
    overflow: 'hidden',
  },
  tipsContainer: {
    flex: 1,
    marginTop: 10,
    gap: 14,
  },
  tipBox: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 0,
  },
  yellow: {
    backgroundColor: '#FFD166',
  },
  pink: {
    backgroundColor: '#EF476F',
  },
  tipTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
    color: '#222',
  },
  tipTitlePink: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
    color: '#fff',
  },
  tipText: {
    fontSize: 15,
    color: '#222',
  },
});

export default DuvidasScreen;