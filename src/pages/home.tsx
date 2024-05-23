import React, { useState, useEffect, useRef } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonTextarea,
  IonTitle,
  IonToolbar,
  IonItemDivider,
  useIonToast,
  IonAlert
} from '@ionic/react';
import { trashOutline, pencilOutline } from 'ionicons/icons';
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { useHistory } from 'react-router-dom';
import './TodoList.css'; // Assuming you have a separate CSS file for styling

interface ToDoItem {
  id: string;
  title: string;
  description: string;
  dateAdded: string;
  completed: boolean;
}

const Todos: React.FC = () => {
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const inputRefTitle = useRef<HTMLIonInputElement>(null);
  const inputRefDescription = useRef<HTMLIonTextareaElement>(null);
  const [present] = useIonToast();
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        history.push('/login');
      } else {
        fetchToDos(user.uid);
        fetchUserName(user.uid);
      }
    });
    return unsubscribe;
  }, [history]);

  const fetchToDos = async (userId: string) => {
    const q = query(collection(db, 'todos'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        dateAdded: doc.data().dateAdded,
        completed: doc.data().completed
      })));
    });
    return unsubscribe;
  };

  const fetchUserName = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserName(userData.name);
      }
    } catch (error) {
      console.error('Error fetching user name: ', error);
    }
  };

  const clearInput = () => {
    setNewTitle('');
    setNewDescription('');
    if (inputRefTitle.current && inputRefDescription.current) {
      inputRefTitle.current.setFocus();
    }
  };

  const addTodoToast = (message: string) => {
    present({
      message,
      duration: 1500,
      position: 'middle',
    });
  };

  const addTodo = async () => {
    if (newTitle.trim() === '') return;
    try {
      const user = auth.currentUser;
      if (user) {
        const currentDate = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'todos'), {
          title: newTitle,
          description: newDescription,
          dateAdded: currentDate,
          completed: false,
          userId: user.uid
        });
        setTodos([...todos, { id: docRef.id, title: newTitle, description: newDescription, dateAdded: currentDate, completed: false }]);
        clearInput();
        addTodoToast('Added new Todo');
      }
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const editTodo = (index: number) => {
    setEditIndex(index);
    const editedTodo = todos[index];
    setNewTitle(editedTodo.title);
    setNewDescription(editedTodo.description);
  };

  const updateTodo = async () => {
    if (editIndex !== null) {
      try {
        const todoToUpdate = todos[editIndex];
        await updateDoc(doc(db, 'todos', todoToUpdate.id), {
          title: newTitle,
          description: newDescription,
        });
        clearInput();
        setEditIndex(null);
        addTodoToast('Changes Saved');
      } catch (error) {
        console.error('Error updating document: ', error);
      }
    }
  };

  const cancelEdit = () => {
    clearInput();
    setEditIndex(null);
  };

  const deleteTodo = async (index: number) => {
    try {
      const todoToDelete = todos[index];
      await deleteDoc(doc(db, 'todos', todoToDelete.id));
      setTodos(todos.filter((_, i) => i !== index));
      addTodoToast('Todo deleted');
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      history.push('/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Todos</IonTitle>
          
          <IonButton slot="end" onClick={() => setShowLogoutAlert(true)} fill='clear'>Logout</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard color={'warning'}>
          <IonCardHeader>
            <IonCardTitle>
              <IonInput
                placeholder="Enter task"
                value={newTitle}
                onIonInput={(e) => setNewTitle(e.detail.value!)}
                ref={inputRefTitle}
              ></IonInput>
            </IonCardTitle>
            <IonTextarea
              placeholder="Enter description"
              value={newDescription}
              onIonInput={(e) => setNewDescription(e.detail.value!)}
              ref={inputRefDescription}
            ></IonTextarea>
          </IonCardHeader>
          <IonCardContent>
            <IonRow>
              <IonCol>
                <IonButton expand="block" onClick={editIndex !== null ? updateTodo : addTodo} color={'dark'}>
                  {editIndex !== null ? 'Update' : 'Add'}
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton expand="block" fill="clear" onClick={editIndex !== null ? cancelEdit : clearInput} color={'dark'}>
                  {editIndex !== null ? 'Cancel' : 'Clear'}
                </IonButton>
                
              </IonCol>
            </IonRow>
            
            
          </IonCardContent>
        </IonCard>
        <br />
        <IonCard>
          <IonItemDivider color="light">
            <IonLabel>Todos</IonLabel>
          </IonItemDivider>
          <IonList>
            {todos.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).map((todo, index) => (
              <IonItem key={todo.id}>
                <IonLabel>
                  <h2>{todo.title}</h2>
                  <p>{todo.description}</p>
                  <p>{new Date(todo.dateAdded).toLocaleString()}</p>
                </IonLabel>
                <IonButton fill="clear" onClick={() => editTodo(index)}>
                  <IonIcon icon={pencilOutline} />
                </IonButton>
                <IonButton fill="clear" onClick={() => deleteTodo(index)}>
                  <IonIcon icon={trashOutline} />
                </IonButton>
                
              </IonItem>
            ))}
          </IonList>
        </IonCard>
      </IonContent>
      <IonAlert
        isOpen={showLogoutAlert}
        onDidDismiss={() => setShowLogoutAlert(false)}
        header={`Confirm Logout`}
        message={`Are you sure you want to logout, ${userName}?`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              setShowLogoutAlert(false);
            }
          },
          {
            text: 'Logout',
            handler: handleLogout
          }
        ]}
      />
    </IonPage>
  );
};

export default Todos;
