import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  mediaDevices,
  MediaStream,
  MediaStreamConstraints,
} from 'react-native-webrtc';
import { MainContext as MainContextType } from '../contexts';
import { navigate } from '../navigation';
import {
  Call,
  CallSession,
  CreatedChannelResult,
  GetCallsSucceededResult,
  GetUsersSucceededResult,
  StartedCallResult,
  StartedCallSessionResult,
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
  callSession: null,
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
  const [callSession, setCallSession] = useState<CallSession | null>(null);

  const startCallSession = (call: Call, stream: MediaStream) => {
    console.log('start call: ', call);
    let result = kitty.Calls.startCallSession({
      call,
      stream,
      onParticipantAcceptedCall: (participant) => {
        setRemoteUser(participant);
      },
      onParticipantRejectedCall: (participant) => {
        setRemoteUser(null);
        callSession?.end();
        Alert.alert('Your call request rejected by ' + participant.name);
        navigate('Users');
      },
      onParticipantAddedStream: (participant, participantStream) => {
        setRemoteUser(participant);
        setRemoteStream(participantStream);
      },
      onCallEnded: () => {
        closeCall();
      },
    }) as StartedCallSessionResult;

    setCallSession(result.session);

    navigate('Call');
  };

  useEffect(() => {
    kitty.onCurrentUserChanged((user) => {
      setCurrentUser(user);
    });
  }, []);

  const login = async (username: string) => {
    const isFrontCamera = true;
    const devices = await mediaDevices.enumerateDevices();

    const facing = isFrontCamera ? 'front' : 'environment';
    const videoSourceId = devices.find(
      (device: any) => device.kind === 'videoinput' && device.facing === facing
    );
    const facingMode = isFrontCamera ? 'user' : 'environment';
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: {
        mandatory: {
          minWidth: 1280,
          minHeight: 720,
          minFrameRate: 30,
        },
        facingMode,
        optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
      },
    };

    const stream = (await mediaDevices.getUserMedia(
      constraints
    )) as MediaStream;

    setLocalStream(stream);

    await kitty.startSession({ username: username });

    await kitty.Calls.initialize();

    kitty.getUsers({ filter: { online: true } }).then((result) => {
      setUsers((result as GetUsersSucceededResult).paginator.items);
    });

    kitty.onUserPresenceChanged(async () => {
      setUsers(
        (
          (await kitty.getUsers({
            filter: { online: true },
          })) as GetUsersSucceededResult
        ).paginator.items
      );
    });

    kitty.Calls.onCallInvite((call) => {
      Alert.alert(
        'New Call',
        'You have a new call from ' + call.creator.displayName,
        [
          {
            text: 'Reject',
            onPress: () => {
              kitty.Calls.rejectCall({ call });
            },
            style: 'cancel',
          },
          {
            text: 'Accept',
            onPress: () => {
              startCallSession(call, stream);
            },
          },
        ],
        { cancelable: false }
      );
    });
  };

  const call = async (user: User) => {
    const channel = (
      (await kitty.createChannel({
        type: 'DIRECT',
        members: [{ username: user.name }],
      })) as CreatedChannelResult
    ).channel;

    let aCall = (
      (await kitty.Calls.getCalls({
        channel,
        filter: { active: true },
      })) as GetCallsSucceededResult
    ).paginator.items[0];

    if (!aCall) {
      aCall = ((await kitty.Calls.startCall({ channel })) as StartedCallResult)
        .call;
    }

    if (localStream) {
      startCallSession(aCall, localStream);
    }
  };

  const switchCamera = () => {
    if (localStream) {
      // @ts-ignore
      localStream.getVideoTracks().forEach((track) => track._switchCamera());
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  const closeCall = () => {
    callSession?.end();
    setCallSession(null);
    setRemoteUser(null);
    navigate('Users');
    Alert.alert('Call is ended');
  };

  const logout = async () => {
    await kitty.endSession();
    setCallSession(null);
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
        callSession,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;
