// screens/WelcomeScreen.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>

    <Text style={styles.title}>FalaAI</Text>
      
    
    <Image 
        source={require('../assets/imagens/logo.png')} 
        style={styles.image}
    />
      
    <Text style={styles.subtitle}>Conheça seu Assistente de Currículos Inteligentes</Text>
      <Text style={styles.description}>
        Transforme sua voz em oportunidades. Crie seu currículo inteligente em segundos e se
        destaque no mercado.
      </Text>

      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Recording')} 
      >
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Todos os direitos reservados</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF476F',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Anton-Regular', 
    fontSize: 77,
    fontWeight: 'bold', 
      color: '#000000', 
      marginBottom: 10,
      },
      subtitle: {
      fontFamily: 'RobotoCondensed-ExtraBold', 
      fontSize: 33,
      fontWeight: '800', 
      textAlign: 'center',
      color: '#000000', // 
      marginBottom: 15,
      },
      description: {
      fontFamily: 'Roboto',
      fontWeight: 300,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 30,
      color: '#000000', 
  },
  button: {
    backgroundColor: '#118AB2',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 12,
    color: '#FFFFFE',
    position: 'absolute',
    bottom: 20,
  },
});

export default WelcomeScreen;
