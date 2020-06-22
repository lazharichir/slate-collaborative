import React from "react";
import {SlateOperation, SlateSelection, SlateValue} from "@wleroux/slate-value";
import {ResourceService} from "@wleroux/resource-service";

//@ts-ignore
export const SlateResourceServiceContext = React.createContext<ResourceService<SlateValue, SlateSelection, SlateOperation>>(undefined);
