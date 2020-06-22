import React from "react";
import {SlateOperation, SlateSelection, SlateValue} from "slate-value";
import {ResourceService} from "resource-service";

//@ts-ignore
export const SlateResourceServiceContext = React.createContext<ResourceService<SlateValue, SlateSelection, SlateOperation>>(undefined);
