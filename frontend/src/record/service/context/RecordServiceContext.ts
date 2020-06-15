import React from 'react';
import NetworkAwareRecordService from "../infrastructure/NetworkAwareRecordService";
import {RecordService} from "../domain/RecordService";

export default React.createContext<RecordService>(new NetworkAwareRecordService());
