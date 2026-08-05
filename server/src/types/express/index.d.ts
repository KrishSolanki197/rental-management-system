
//  this is the TypeScript declaration file

import type {
    AuthUser
} from '../auth.ts';


declare global{
    namespace Express{
        interface Request{
            user?: AuthUser;
        }
    }
}

export {}