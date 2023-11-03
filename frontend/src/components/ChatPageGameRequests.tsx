import { useState, useEffect } from "react";
import { ChatUserList, friendToUserType } from '../data/ChatData';
import { Box, Stack, IconButton, Typography, Divider, Avatar, Button } from "@mui/material";
import { CircleDashed, Handshake } from "phosphor-react";
import ChatConversation from "./ChatConversation";
import { ChatProps, User, Chat, TGameReq } from "../types";
import ChatFriends from "./ChatFriends";
import { useSelector } from "react-redux";
import { selectChatStore } from "../redux/store";
import ChatUserProfile from "./ChatUserProfile";
import { useDispatch } from "react-redux";
import { selectConversation, updateChatActiveUser, updateStateUserFriendDialog, updateChatDirectMessages } from "../redux/slices/chatSlice";
import { enChatType, enGameDifficulty } from "../enums";
import Cookies from 'js-cookie';
import { fr, faker } from "@faker-js/faker";
import axios from 'axios';
import { PRIVATE } from '../APP_CONSTS';

// export const fetchAllDirectMessages = (allMessages: Chat[], userId: any, friend: any): Chat[] => {
//     const chats = allMessages.filter((el) => {
//         if (el.type == PRIVATE) {
//             if (el.author == userId && el.receiver == friend) {
//                 return el;
//             }
//             if (el.receiver == userId && el.author == friend) {
//                 return el;
//             }
//         }
//     });
//     return chats;
// }
const GetUserById = (userId: string | number ): User => {
    const chatStore = useSelector(selectChatStore);
    const users = chatStore.chatUsers.filter( (el) => el.id == userId.toString())
    if (users.length)
    {
        return (users[0])
    }
    return users[0]
}

//const getReqSenderUserData = (request: TGameReq) : User => 
const ChatGameRequestElement = (request: TGameReq) => {
    const userId = Cookies.get('userId') ? Cookies.get('userId') : '';
    console.log("Show userId", userId)
    const chatStore = useSelector(selectChatStore);
    const dispatch = useDispatch();
    let activeUser = {} as User
    activeUser = GetUserById(request.sender);

    return (
        <Box 
            onClick={ () => {
                // dispatch(selectConversation({chatRoomId: user.id, chatType: enChatType.OneOnOne}))
                // dispatch(updateChatActiveUser(chatStore.chatUserFriends.filter((el) => {
                //     if (el.sender == user.id && el.receiver == userId) {
                //         return el;
                //     }
                //     if (el.receiver == user.id && el.sender == userId) {
                //         return el;
                //     }
                // })[0]));
                // const newDirectMessages = fetchAllDirectMessages(chatStore.chatUserMessages, userId, user.id);
                // dispatch(updateChatDirectMessages(newDirectMessages))
                activeUser = GetUserById(request.sender);
            }}
            sx={{
                width: "100%",
                backgroundColor: "#ddd",
                borderRadius: 1
            }}
            p={2}
        >
            <Stack 
                direction={"row"}
                alignItems={"center"} 
                justifyContent={"space-between"}
            >
                <Stack direction="row" spacing={2}>
                    <Avatar 
                        alt={ activeUser? activeUser.userName : faker.person.firstName()  } 
                        src={ activeUser? activeUser.avatar : faker.image.avatar() }
                    />
                </Stack>
                <Stack spacing={0.2} alignItems={"center"}>
                    <Typography variant="subtitle2">
                        { activeUser? activeUser.userName : faker.person.firstName()}
                    </Typography>
                    {/* <Typography variant="caption">{  } </Typography> */}
                </Stack>
                <Stack spacing={2} alignItems={"center"}>
                    <Typography variant="caption">{ request.difficulty }</Typography>
                </Stack>
                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                    {
                        // (isSender(reqData)) &&
                        <Button onClick={() => {}} sx={{backgroundColor: "#af9"}}
                        > Accept
                        </Button>
                    }
                    {
                        // (isSender(reqData)) &&
                        <Button onClick={() => {}} sx={{backgroundColor: "#fa9"}}
                        > Deny
                        </Button>
                    }
                </Stack>

            </Stack>
        </Box>
    ); 
}

const  ChatPageGameRequests = (chatProp : ChatProps) => {
    // const [dialogState, setDialogState] = useState<boolean>(false);
    const chatStore = useSelector(selectChatStore)
    const dispatch = useDispatch()
    const handleOpenDialog = ()=>{
        dispatch(updateStateUserFriendDialog(true));
        // setDialogState(true)
    }
    // const handleCloseDialog = ()=>{
    //     dispatch(updateStateUserFriendDialog(false)); 
    //     // setDialogState(false)
    // }
    return (
    <>
        <Stack direction={"row"} sx={{ width: "95vw"}}>
        <Box 
          sx={{
            position:"relative",
            height: "100%",
            minWidth: "450px",
            backgroundColor: "white",
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)"
          }}>
                <Stack p={3} spacing={1} sx={{height:"75vh"}} >

                    {/* Chatuserlist */}
                    <Stack 
                        direction={"row"} 
                        alignItems={"centered"} 
                        justifyContent={"space-between"}
                    >
                        <Typography variant='h5'>Game Challenge Requests</Typography>
                        {/* <Stack direction={"row"} alignItems={"centered"} spacing={1}>
                            <IconButton onClick={()=>{handleOpenDialog()}}>
                                <Handshake/>
                            </IconButton>
                        </Stack> */}
                    </Stack>
                    <Divider/>
                    <Stack 
                        sx={{flexGrow:1, overflowY:"scroll", height:"100%"}}
                        spacing={0.5} 
                    >
                            {chatStore.chatGameRequests
                                .filter((request) => {
                                    if (request.sender == chatProp.userId || request.receiver == chatProp.userId) {
                                        return request;
                                    }
                                })
                                .filter((reqSender) => {
                                    if (reqSender.sender != chatProp.userId ) {
                                        return reqSender;
                                    }
                                })
                                // .map((incomingRequest) => getUserById(incomingRequest.sender))
                                .map((incomingRequest) => {
                                    return (<ChatGameRequestElement {...incomingRequest} key={incomingRequest.id} />)
                                })}
                    </Stack>
                </Stack>
        </Box>

                {/* conversation panel */}
                <Stack sx={{ width: "100%" }} alignItems={"center"} justifyContent={"center"}>
                    {chatStore.chatRoomId !== null && chatStore.chatType === enChatType.OneOnOne 
                        ? <ChatConversation userId={chatProp.userId} />
                        : <Typography variant="subtitle2">Select game request to view challenger </Typography>
                    }
                </Stack>

                {/* show profile for user or group on toggle. it depends on which chat is selected */}
                <Stack>
    			{ chatStore.chatSideBar.open && <ChatUserProfile/> }
                </Stack>
        </Stack>
        {/* handle friend request dialog panel */}
        { chatStore.chatUserFriendDialogState && <ChatFriends />}
    </>
      );
}
 

export default ChatPageGameRequests  ;