import React, { useContext } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainContext } from '../providers/MainProvider';

const UsersScreen = () => {
  const { currentUser, users, call, logout } = useContext(MainContext);

  const currentCall = null;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Online Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <Text style={styles.text}>{item.name}</Text>
              {currentUser?.name !== item.name ? (
                <TouchableOpacity
                  disabled={!!currentCall}
                  onPress={() => call(item)}
                  style={[styles.btn, { opacity: currentCall ? 0.3 : 1 }]}
                >
                  <Text style={styles.btnText}>Call</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.text}>(me)</Text>
              )}
            </View>
          );
        }}
      />
      <TouchableOpacity onPress={logout}>
        <Text style={[styles.text, { textAlign: 'center' }]}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default UsersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  card: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.6,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    color: '#333',
    margin: 12,
  },
  text: {
    fontSize: 22,
    margin: 5,
  },
  btn: {
    backgroundColor: '#341EFF',
    padding: 12,
    borderRadius: 99,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
  },
});
