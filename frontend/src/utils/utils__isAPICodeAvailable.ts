
import { TUserAuth } from "../types";

/**
 * @brief This functions is used to check if the code string is available in url upon contact with 42 API
 *        It sets the boolean variable 'isAuth' to true, if code string is found.
 * @param userAuth 
 * @returns true if code string is available
 *          false if not available
 */
export const utils__isAPICodeAvailable = ( userAuth : TUserAuth ): boolean =>
{
    var result = false;
    const urlBrowser = window.location.href;
    console.log("HOME_APP entry: call to app " +  urlBrowser);
    
    if (userAuth.code === null && userAuth.isAuth === false)
    {
        // parse the url and retrieve the query parameters where code value is stored
        const urlSearchParams = new URLSearchParams(urlBrowser.split('?')[1]);
        console.log(urlSearchParams);
        Array.from((urlSearchParams.entries())).map(([key, value]) => {
            if (key === "code") {
                console.log(value);
                userAuth.setCode(value);
                userAuth.setIsAuth(true);
                result = true;
            }
        });
    }
    console.log("HOME_APP exit: call to app " + userAuth.code + "; state: " + userAuth.isAuth);
    return (result);
}

export default utils__isAPICodeAvailable