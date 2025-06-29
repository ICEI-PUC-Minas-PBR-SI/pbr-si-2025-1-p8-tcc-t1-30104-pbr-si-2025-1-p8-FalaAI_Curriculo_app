# Metodologia

<span style="color:red">Pré-requisitos: <a href="3-Especificação.md">Especificação</a></span>

A metodologia deste estudo é aplicada, com foco na criação de um software de um aplicativo móvel que utiliza reconhecimento de fala e Inteligência Artificial para auxiliar jovens  na criação de currículos. A pesquisa busca desenvolver uma solução prática para um problema específico, no caso, a criação de currículos de forma mais acessível e eficiente. A pesquisa também pode ser classificada como exploratória, pois investiga a viabilidade de tecnologias emergentes, como o reconhecimento de voz e a inteligência artificial, em um contexto específico de inserção no mercado de trabalho. A análise dos dados foi realizada por meio de uma abordagem mista: quantitativa e qualitativa. A abordagem quantitativa foi aplicada por meio de questionários, que permitiram a coleta de dados objetivos sobre as funcionalidades do aplicativo, a precisão do reconhecimento de voz e a satisfação dos jovens. Já a abordagem qualitativa envolveu a análise do feedback aberto dos participantes.

## Tecnologias Utilizadas

- React Native 
    Framework para desenvolvimento do aplicativo móvel, garantindo compatibilidade com dispositivos Android e iOS.
- Python com FastAPI 
    Utilizado no backend para gerenciar a lógica da aplicação e integrar com os serviços de Inteligência Artificial.
- Google Gemini 
    Inteligência Artificial empregada para o reconhecimento de voz e transcrição automática de áudio em texto.
- Figma
    Ferramenta empregada para a prototipação e design das interfaces do aplicativo, facilitando a definição da experiência do usuário.

## Descrição dos processos 

O funcionamento do aplicativo inicia-se com o acesso do usuário à interface principal, onde é orientado a gravar suas informações pessoais, acadêmicas e profissionais por meio de comandos de voz. O áudio capturado é enviado para processamento pelo modelo de Inteligência Artificial Google Gemini, responsável pela transcrição precisa da fala em texto. Após a transcrição, o sistema realiza o processamento e a formatação automática dos dados, organizando as informações conforme a estrutura padrão de um currículo profissional. Em seguida, o currículo é gerado em formato PDF e armazenado localmente no dispositivo do usuário, garantindo praticidade, segurança e facilidade para o compartilhamento do documento em processos seletivos e oportunidades de emprego.

> A seguir, é apresentado o fluxograma que representa de forma visual as etapas do processo desenvolvido no aplicativo.

![Arquitetura da projeto.jpeg](imagem/Arquitetura%20da%20projeto.jpeg)
Fonte: elaborado pelo autor (2025).


[Próximo](./5-Resultado.md)
