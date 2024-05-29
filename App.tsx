import { Button, StyleSheet, View, FlatList } from "react-native";
import { StatusBar } from "expo-status-bar";
import { observable } from "@legendapp/state";
import {
  configureObservablePersistence,
  persistObservable,
} from "@legendapp/state/persist";
import { ObservablePersistFirebase } from "@legendapp/state/persist-plugins/firebase";
import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { observer } from "@legendapp/state/react";
import { initializeApp } from "firebase/app";
import Expense from "./components/Expense";
import { getRandomImageUrl } from "./utils/getRandomImage";
import Header from "./components/Header";
import { randomPostNames } from "./constants/posts";
import { firebaseConfig } from "./constants/firebase";

// Initialize Firebase
initializeApp(firebaseConfig);

configureObservablePersistence({
  // Use AsyncStorage in React Native
  pluginLocal: ObservablePersistAsyncStorage,
  localOptions: {
    asyncStorage: {
      // The AsyncStorage plugin needs to be given the implementation of AsyncStorage
      AsyncStorage,
    },
  },
});

const state = observable({
  posts: [
    {
      id: "1",
      title: "Groceries",
      amount: 50.0,
      imageUrl: getRandomImageUrl(),
      date: new Date().toLocaleString(),
    },
    {
      id: "2",
      title: "Electric Bill",
      amount: 75.0,
      imageUrl: getRandomImageUrl(),
      date: new Date().toLocaleString(),
    },
  ],
});

persistObservable(state, {
  local: "persist-demo",
  pluginRemote: ObservablePersistFirebase,
  remote: {
    onSetError: (err: unknown) => console.error(err),
    firebase: {
      refPath: () => `/posts/`,
      mode: "realtime",
    },
  },
});

const App = observer(() => {
  const posts = state.posts.get();

  const addExpense = () => {
    const expenseIndex = posts.length % randomPostNames.length;
    const newExpense = {
      id: Math.random().toString(),
      title: randomPostNames[expenseIndex],
      amount: Math.floor(Math.random() * 100),
      imageUrl: getRandomImageUrl(),
      date: new Date().toLocaleString(),
    };
    state.posts.set((currentExpenses) => [...currentExpenses, newExpense]);
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <Header />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Expense item={item} />}
      />
      <Button title="Add Post" onPress={addExpense} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 50,
  },
});

export default App;
