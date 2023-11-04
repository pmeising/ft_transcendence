import { useState, useEffect } from "react";
import { ChatUserList, friendToUserType } from '../data/ChatData';
import { Box, Stack, IconButton, Typography, Divider, Avatar, Button } from "@mui/material";
import { CircleDashed, Handshake } from "phosphor-react";
import ChatConversation from "./ChatConversation";
import { ChatProps, User, GameType } from "../types";
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

const GetUserById = (userId: string | number ): User => {
    const chatStore = useSelector(selectChatStore);
    const users = chatStore.chatUsers.filter( (el) => el.id == userId.toString())
    if (users.length)
    {
        return (users[0])
    }
    return users[0]
}

//const getReqplayer1UserData = (request: Game) : User => 
const ChatGameRequestElement = (request: GameType) => {
    const userId = Cookies.get('userId') ? Cookies.get('userId') : '';
    console.log("Show userId", userId)
    const chatStore = useSelector(selectChatStore);
    const dispatch = useDispatch();
    let activeUser = {} as User
    activeUser = GetUserById(request.player1);

    return (
        <Box 
            onClick={ () => {
                // dispatch(selectConversation({chatRoomId: user.id, chatType: enChatType.OneOnOne}))
                // dispatch(updateChatActiveUser(chatStore.chatUserFriends.filter((el) => {
                //     if (el.player1 == user.id && el.player2 == userId) {
                //         return el;
                //     }
                //     if (el.player2 == user.id && el.player1 == userId) {
                //         return el;
                //     }
                // })[0]));
                // const newDirectMessages = fetchAllDirectMessages(chatStore.chatUserMessages, userId, user.id);
                // dispatch(updateChatDirectMessages(newDirectMessages))
                activeUser = GetUserById(request.player1);
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
                    {/* accept button  */}
                    <Button onClick={() => {}} sx={{backgroundColor: "#af9"}}
                    > Accept
                    </Button>
                    {/* deny button */}
                    <Button onClick={() => {}} sx={{backgroundColor: "#fa9"}}
                    > Deny
                    </Button>
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

                    {/* game request list */}
                    <Stack 
                        direction={"row"} 
                        alignItems={"centered"} 
                        justifyContent={"space-between"}
                    >
                        <Typography variant='h5'>Game Challenge Requests</Typography>
                    </Stack>
                    <Divider/>
                    <Stack 
                        sx={{flexGrow:1, overflowY:"scroll", height:"100%"}}
                        spacing={0.5} 
                    >
                            {chatStore.chatGameRequests
                                .filter((request) => {
                                    if (request.player1.toString() == chatProp.userId || 
                                        request.player2.toString() == chatProp.userId) {
                                        return request;
                                    }
                                })
                                .filter((reqplayer1) => {
                                    if (reqplayer1.player1.toString() != chatProp.userId ) {
                                        return reqplayer1;
                                    }
                                })
                                // .map((incomingRequest) => getUserById(incomingRequest.player1))
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