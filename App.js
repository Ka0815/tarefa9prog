import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

// 🔥 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCVhgNp0NJsQ8F23nBJBUXASsOaIAdKERg",
  authDomain: "tarefa-c6b64.firebaseapp.com",
  projectId: "tarefa-c6b64",
  storageBucket: "tarefa-c6b64.appspot.com",
  messagingSenderId: "694195114045",
  appId: "1:694195114045:web:b17724d3bcae309b3d1a54",
};

// 🔧 Inicializa Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [user, setUser] = useState(null);
  const [usuariosCadastrados, setUsuariosCadastrados] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        buscarUsuarios();
      }
    });
    return () => unsubscribe();
  }, []);

  const cadastrar = async () => {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const novoUsuario = userCredential.user;

      await addDoc(collection(db, "usuarios"), {
        email: novoUsuario.email,
        uid: novoUsuario.uid,
      });

      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      setEmail("");
      setSenha("");

      buscarUsuarios();
    } catch (error) {
      Alert.alert("Erro ao cadastrar", error.message);
    }
  };

  const login = () => {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    signInWithEmailAndPassword(auth, email, senha)
      .then(() => {
        Alert.alert("Sucesso", "Login realizado com sucesso!");
        setEmail("");
        setSenha("");
        buscarUsuarios();
      })
      .catch((error) => {
        Alert.alert("Erro ao logar", error.message);
      });
  };

  const sair = () => {
    signOut(auth)
      .then(() => {
        Alert.alert("Logout", "Você saiu da conta.");
        setUsuariosCadastrados([]);
      })
      .catch((error) => {
        Alert.alert("Erro ao sair", error.message);
      });
  };

  const buscarUsuarios = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push(doc.data().email);
      });
      setUsuariosCadastrados(lista);
    } catch (error) {
      Alert.alert("Erro ao buscar usuários", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Imagem do Nubank */}
      <Image
        source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Nubank_logo_2018.svg/1200px-Nubank_logo_2018.svg.png" }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.titulo}>Bem-vindos ao Nubank</Text>

      {user ? (
        <>
          <Text style={styles.usuario}>Logado como: {user.email}</Text>

          <TouchableOpacity style={styles.botaoSair} onPress={sair}>
            <Text style={styles.textoBotao}>Sair</Text>
          </TouchableOpacity>

          <Text style={styles.subtitulo}>Usuários cadastrados:</Text>
          <ScrollView style={{ width: "100%", maxHeight: 200 }}>
            {usuariosCadastrados.map((u, i) => (
              <Text key={i} style={styles.usuarioLista}>{u}</Text>
            ))}
          </ScrollView>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#ddd"
          />
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            placeholderTextColor="#ddd"
          />

          <TouchableOpacity style={styles.botaoCadastrar} onPress={cadastrar}>
            <Text style={styles.textoBotao}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoLogin} onPress={login}>
            <Text style={styles.textoBotao}>Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#a691d8ff" }, // azul bebê
  logo: { width: 120, height: 120, marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 20, textAlign: "center" },
  subtitulo: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    color: "#555",
  },
  botaoCadastrar: { backgroundColor: "#670bbdff", padding: 12, borderRadius: 8, width: "100%", alignItems: "center", marginTop: 10 },
  botaoLogin: { backgroundColor: "#670bbdff", padding: 12, borderRadius: 8, width: "100%", alignItems: "center", marginTop: 10 },
  botaoSair: { backgroundColor: "#670bbdff", padding: 12, borderRadius: 8, width: "100%", alignItems: "center", marginTop: 10 },
  textoBotao: { color: "#fff", fontWeight: "bold" },
  usuario: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  usuarioLista: { fontSize: 16, paddingVertical: 2 },
});
