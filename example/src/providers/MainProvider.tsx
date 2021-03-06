import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { MediaStream } from 'react-native-webrtc';
import { MainContext as MainContextType } from '../contexts';
import { navigate } from '../navigation';
import {
  GetUsersSucceededResult,
  succeeded,
  User,
} from 'react-native-chatkitty';
import kitty from '../chatkitty';

const initialValues: MainContextType = {
  login: () => {},
  currentUser: null,
  users: [],
  localStream: null,
  remoteStream: null,
  remoteUser: null,
  call: () => {},
  switchCamera: () => {},
  toggleMute: () => {},
  isMuted: false,
  closeCall: () => {},
  logout: () => {},
};

export const MainContext = React.createContext(initialValues);

interface Props {}

const MainContextProvider: React.FC<Props> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(initialValues.currentUser);
  const [users, setUsers] = useState<User[]>(initialValues.users);
  const [localStream, setLocalStream] = useState<MediaStream | null>(
    initialValues.localStream
  );
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(
    initialValues.remoteStream
  );
  const [remoteUser, setRemoteUser] = useState<User | null>(null);
  const [isMuted, setIsMuted] = useState(initialValues.isMuted);

  useEffect(() => {
    kitty.onCurrentUserChanged((user) => {
      setCurrentUser(user);
    });
  }, []);

  const login = async (username: string) => {
    await kitty.startSession({ username: username });

    await kitty.Calls.initialize({
      media: { audio: true, video: true },
    });

    setLocalStream(kitty.Calls.localStream);

    const fetchUsers = async () => {
      const getUsersResult = await kitty.getUsers({ filter: { online: true } });

      if (succeeded<GetUsersSucceededResult>(getUsersResult)) {
        setUsers(getUsersResult.paginator.items);
      }
    };

    await fetchUsers();

    kitty.onUserPresenceChanged(async () => {
      await fetchUsers();
    });

    kitty.Calls.onCallInvite((call) => {
      Alert.alert(
        'New Call',
        'You have a new call from ' + call.creator.displayName,
        [
          {
            text: 'Reject',
            onPress: async () => {
              await kitty.Calls.declineCall({ call });
            },
            style: 'cancel',
          },
          {
            text: 'Accept',
            onPress: async () => {
              await kitty.Calls.acceptCall({ call });
            },
          },
        ],
        { cancelable: false }
      );
    });

    kitty.Calls.onCallActive(() => {
      navigate('Call');
    });

    kitty.Calls.onParticipantAcceptedCall((participant) => {
      setRemoteUser(participant);
    });

    kitty.Calls.onParticipantDeclinedCall((participant) => {
      setRemoteUser(null);

      Alert.alert('Your call request rejected by ' + participant.name);

      navigate('Users');
    });

    kitty.Calls.onParticipantActive((participant, stream) => {
      setRemoteUser(participant);
      setRemoteStream(stream);
    });

    kitty.Calls.onCallEnded(() => {
      closeCall();
    });
  };

  const call = async (user: User) => {
    await kitty.Calls.startCall({ members: [{ username: user.name }] });
  };

  const switchCamera = () => {
    kitty.Calls.switchCamera();
  };

  const toggleMute = () => {
    kitty.Calls.toggleMute();

    setIsMuted(kitty.Calls.isMuted);
  };

  const closeCall = () => {
    kitty.Calls.leaveCall();

    setRemoteUser(null);
    navigate('Users');
    Alert.alert('Call is ended');
  };

  const logout = async () => {
    await kitty.endSession();

    setRemoteUser(null);
    setLocalStream(null);
    setRemoteStream(null);
  };

  return (
    <MainContext.Provider
      value={{
        currentUser,
        users,
        setUsers,
        localStream,
        setLocalStream,
        remoteStream,
        setRemoteStream,
        login,
        call,
        switchCamera,
        toggleMute,
        isMuted,
        closeCall,
        logout,
        remoteUser,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;
