/** Models related to the authentication process */

/** String keys for accessing localStorage data */
export enum StorageKeys {
    loginNonce = 'loginNonce',
    loginRedirect = 'loginRedirect',
    cognitoTokens = 'cognitoTokens'
}

export interface ICognitoUserInfo {
    email: string;
    email_verified: 'true' | 'false';
    sub: string;
    username: string;
}

export interface ICognitoTokens {
    access_token: string;
    expires_in: number; // number of seconds
    id_token: string;
    refresh_token: string;
    token_type: string;
}
