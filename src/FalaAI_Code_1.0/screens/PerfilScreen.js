import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const PerfilScreen = ({ navigation, route }) => {
    const [arquivos, setArquivos] = useState([]);

    useEffect(() => {
        loadSavedFiles();
        
        
        if (route.params?.pdfPath) {
            const { pdfPath, timestamp } = route.params;
            addNewFile(pdfPath, timestamp);
        }
    }, [route.params]);

    const loadSavedFiles = async () => {
        try {
            const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
            const pdfFiles = files.filter(file => file.endsWith('.pdf'));
            
            const fileList = pdfFiles.map((file, index) => ({
                id: index.toString(),
                nome: file.replace('.pdf', ''),
                caminho: `${FileSystem.documentDirectory}${file}`,
                data: new Date().toLocaleDateString()
            }));
            
            setArquivos(fileList);
        } catch (error) {
            console.error('Erro ao carregar arquivos:', error);
        }
    };

    const addNewFile = (pdfPath, timestamp) => {
        const fileName = `curriculo_${new Date(timestamp).toLocaleDateString().replace(/\//g, '-')}`;
        const newFile = {
            id: Date.now().toString(),
            nome: fileName,
            caminho: pdfPath,
            data: new Date(timestamp).toLocaleDateString()
        };
        
        setArquivos(prev => [newFile, ...prev]);
    };

    const handleDownload = async (arquivo) => {
        try {
            const fileExists = await FileSystem.getInfoAsync(arquivo.caminho);
            
            if (fileExists.exists) {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(arquivo.caminho, {
                        mimeType: 'application/pdf',
                        dialogTitle: 'Compartilhar PDF'
                    });
                } else {
                    Alert.alert('Sucesso', `Arquivo localizado em: ${arquivo.caminho}`);
                }
            } else {
                Alert.alert('Erro', 'Arquivo não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao fazer download:', error);
            Alert.alert('Erro', 'Não foi possível acessar o arquivo.');
        }
    };

    const handleDeleteFile = async (arquivo) => {
        Alert.alert(
            'Excluir Arquivo',
            `Deseja excluir "${arquivo.nome}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Excluir', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await FileSystem.deleteAsync(arquivo.caminho);
                            setArquivos(prev => prev.filter(file => file.id !== arquivo.id));
                            Alert.alert('Sucesso', 'Arquivo excluído.');
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir o arquivo.');
                        }
                    }
                }
            ]
        );
    };

    const renderArquivo = ({ item }) => (
        <View style={styles.arquivoContainer}>
            <View style={styles.arquivoInfo}>
                <Ionicons name="document-text" size={24} color="#E91E63" style={styles.arquivoIcon} />
                <View style={styles.arquivoTexto}>
                    <Text style={styles.arquivoNome}>{item.nome}</Text>
                    <Text style={styles.arquivoData}>{item.data}</Text>
                </View>
            </View>
            <View style={styles.botoesContainer}>
                <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => handleDownload(item)}
                >
                    <Ionicons name="share-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteFile(item)}
                >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Text style={styles.header}>Seus arquivos</Text>
            <Text style={styles.subHeader}>Recentes ({arquivos.length})</Text>
            
            {arquivos.length > 0 ? (
                <FlatList
                    data={arquivos}
                    keyExtractor={(item) => item.id}
                    renderItem={renderArquivo}
                    contentContainerStyle={styles.listaArquivos}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-outline" size={64} color="#666" />
                    <Text style={styles.emptyText}>Nenhum arquivo encontrado</Text>
                    <Text style={styles.emptySubText}>Grave um áudio para gerar seu currículo</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#002B3F',
        paddingHorizontal: 16,
        paddingTop: 40,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 16,
        zIndex: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    subHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    listaArquivos: {
        paddingBottom: 20,
    },
    arquivoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E5E5E5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    arquivoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    arquivoIcon: {
        marginRight: 12,
    },
    arquivoTexto: {
        flex: 1,
    },
    arquivoNome: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    arquivoData: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    botoesContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    downloadButton: {
        backgroundColor: '#E91E63',
        padding: 8,
        borderRadius: 4,
    },
    deleteButton: {
        backgroundColor: '#f44336',
        padding: 8,
        borderRadius: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#fff',
        marginTop: 16,
        fontWeight: 'bold',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default PerfilScreen;