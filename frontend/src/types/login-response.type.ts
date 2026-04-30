export type LoginResponseType = {
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
    user: {
        id: number;
        name: string;
        lastName: string;
    };
};