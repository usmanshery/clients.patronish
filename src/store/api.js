import { createAction } from '@reduxjs/toolkit';

export const apiCall = createAction("apiCall");
export const apiSyncCall = createAction("apiSyncCall");
export const apiCallFailure = createAction("apiCallFailure");