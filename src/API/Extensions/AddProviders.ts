import { Inject } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

type Provider = {
    provide: string;
    useFactory: (datasource: DataSource) => Repository<any>;
    inject: string [];
};

const AddProviders: Provider [] = [];

export default AddProviders;