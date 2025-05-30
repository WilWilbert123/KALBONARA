import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const API_URL = 'http://192.168.0.250:3000/users';
axios.defaults.headers.common['x-api-key'] = 'MwWp0Bywkf23V+20W4LMPA==POH2f0EaGMiVV1pz';

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userss, setnewUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(null);
  const [newUser, setnewUser] = useState({
    name: '',
    email: '',
    age: '',
    username: '',
    password: '',
    role: '',
  });

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => {
        setnewUsers(res.data);
        setIsConnected(true);
      })
      .catch((err) => {
        console.error('Connection Error:', err.message);
        setIsConnected(false);
      });
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(API_URL);
      setnewUsers(res.data);
      setIsConnected(true);
    } catch (err) {
      console.error('Refresh failed:', err.message);
      setIsConnected(false);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleEdit = (id) => {
    setnewUsers((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, isEditing: !item.isEditing } : item
      )
    );
  };

  const handleChange = (id, field, value) => {
    setnewUsers((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleUpdate = async (item) => {
    try {
      const { _id, isEditing, ...dataToUpdate } = item;

      const res = await axios.put(`${API_URL}/${_id}`, dataToUpdate);

      setnewUsers((prev) =>
        prev.map((p) =>
          p._id === _id ? { ...res.data, isEditing: false } : p
        )
      );
    } catch (err) {
      console.error('Update failed:', err?.response?.data || err.message);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setnewUsers((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Delete failed:', err?.response?.data || err.message);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleAdd = async () => {
    try {
      const res = await axios.post(API_URL, {
        ...newUser,
        age: Number(newUser.age),
      });

      setnewUsers((prev) => [res.data, ...prev]);
      setnewUser({ name: '', email: '', age: '', username: '', password: '', role: '' });
    } catch (err) {
      console.error('Add failed:', err?.response?.data || err.message);
      alert('Failed to add item. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={[
          styles.statusText,
          {
            color:
              isConnected === null
                ? 'gray'
                : isConnected
                ? 'green'
                : 'red',
          },
        ]}
      >
        {isConnected === null
          ? 'Checking connection...'
          : isConnected
          ? '✅ Connected to servers'
          : '❌ Not connected to server'}
      </Text>

      {isConnected === null && <ActivityIndicator size="large" color="gray" />}

      <View style={styles.card}>
        <View style={styles.buttonRow}>
          {!showAddForm && (
            <TouchableOpacity onPress={() => setShowAddForm(true)}>
              <Text style={styles.addnewuser}>➕ Add New User</Text>
            </TouchableOpacity>
          )}
        </View>

        {showAddForm && (
          <>
            <TextInput
              placeholder="Name"
              value={newUser.name}
              onChangeText={(text) =>
                setnewUser({ ...newUser, name: text })
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              value={newUser.email}
              onChangeText={(text) =>
                setnewUser({ ...newUser, email: text })
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Age"
              keyboardType="numeric"
              value={newUser.age}
              onChangeText={(text) =>
                setnewUser({ ...newUser, age: text })
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Username"
              value={newUser.username}
              onChangeText={(text) =>
                setnewUser({ ...newUser, username: text })
              }
              style={styles.input}
            />
             <TextInput
              placeholder="Password"
              value={newUser.password}
              onChangeText={(text) =>
                setnewUser({ ...newUser, password: text })
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Role"
              value={newUser.role}
              onChangeText={(text) =>
                setnewUser({ ...newUser, role: text })
              }
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => {
                  handleAdd();
                  setShowAddForm(false);
                }}
              >
                <Text style={styles.saveButton}>✅ Add User</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <Text style={styles.cancelButton}>❌ Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <FlatList
        data={userss}
        keyExtractor={(item) => item._id}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.isEditing ? (
              <>
                <Text>Name:</Text>
                <TextInput
                  value={item.name}
                  onChangeText={(text) => handleChange(item._id, 'name', text)}
                  style={styles.input}
                />
                <Text>Email:</Text>
                <TextInput
                  value={item.email}
                  onChangeText={(text) => handleChange(item._id, 'email', text)}
                  style={styles.input}
                />
                <Text>Age:</Text>
                <TextInput
                  value={String(item.age)}
                  onChangeText={(text) =>
                    handleChange(item._id, 'age', Number(text))
                  }
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Text>Username:</Text>
                <TextInput
                  value={item.username}
                  onChangeText={(text) =>
                    handleChange(item._id, 'username', text)
                  }
                  style={styles.input}
                />
                 <Text>Password:</Text>
                <TextInput
                  value={item.password}
                  onChangeText={(text) =>
                    handleChange(item._id, 'password', text)
                  }
                  style={styles.input}
                />
                <Text>Role:</Text>
                <TextInput
                  value={item.role}
                  onChangeText={(text) =>
                    handleChange(item._id, 'role', text)
                  }
                  style={styles.input}
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => handleUpdate(item)}>
                    <Text style={styles.saveButton}>💾 Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleEdit(item._id)}>
                    <Text style={styles.cancelButton}>❌ Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={{ borderWidth: 1, borderColor: 'black',padding: 8,borderRadius: 10 }}>
                <Text style={styles.title}>USER DETAILS</Text>
                <Text style={styles.detail}>{item.email}</Text>
                <Text style={styles.detail}>{item.age} years old</Text>
                <Text style={styles.detail}>Username: {item.username}</Text>
                <Text style={styles.detail}>Password: {item.password}</Text>
                <Text style={styles.detail}>Role: {item.role}</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => toggleEdit(item._id)}>
                    <Text style={styles.editButton}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item._id)}>
                    <Text style={styles.cancelButton}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={() =>
          isConnected && userss.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              No userss available.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { 
flex: 1, 
padding: 16 
},
  statusText: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    
    padding: 16,
    backgroundColor: 'f2f2f2#',
    borderRadius: 8,

  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: 'green',
     borderWidth: 1,
    padding: 8,
    borderRadius: 10,
    marginBottom: 2,
    textAlign: 'center',
 },
  addnewuser: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: 'green',
     borderWidth: 1,
    padding: 8,
    borderRadius: 10,
 },
  input: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  editButton: {
    color: 'blue',
    fontWeight: 'bold',
     borderWidth: 1,
    padding: 5,
    borderRadius: 10,
  },
  saveButton: {
    color: 'green',
    fontWeight: 'bold',
     borderWidth: 1,
    padding: 5,
    borderRadius: 10,
  },
  cancelButton: {
    color: 'red',
    fontWeight: 'bold',
    borderWidth: 1,
    padding: 5,
    borderRadius: 10,
  },
  detail: {
    fontSize: 16,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: 'black',
    padding: 3,
    borderRadius: 8,
  },
});
