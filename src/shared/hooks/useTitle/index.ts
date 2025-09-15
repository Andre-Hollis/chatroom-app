import React from 'react';

import { Config } from '@/shared/config';

export const useTitle = (title?: string, overrideBaseTitle?: boolean) => {


    const appName = React.useMemo(() => {
        if (Config.appName) {
            return Config.appName;
        } else {
            return 'Acuity';
        }
    }, []);

    React.useEffect(() => {
        if (!title) {
            document.title = appName;
        } else {
            document.title = overrideBaseTitle ? title : `${title} - ${appName}`;
        }
    }, [appName, title, overrideBaseTitle]);
};
