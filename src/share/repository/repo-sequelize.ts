import { PagingDTO } from "../model/paging";
import { ICommandRepository, IQueryRepository, IRepository } from "../interface";
import { Sequelize } from "sequelize";
import { ModelStatus } from "../model/base-model";
import { Op } from "sequelize";

//implement ORM here(Sequelize)
export abstract class BaseRepositorySequelize<Entity,Cond,UpdateDTO> implements IRepository<Entity,Cond,UpdateDTO> {
   constructor(
    readonly queryRepo: IQueryRepository<Entity, Cond>,
    readonly cmdRepo: ICommandRepository<Entity, UpdateDTO>
){ }

    async get(id: string): Promise<Entity | null> {
    return this.queryRepo.get(id)
    }

    async findByCond(cond: Cond): Promise<Entity | null> {
        return this.queryRepo.findByCond(cond)
    }

    async list(cond: Cond, paging: PagingDTO): Promise<Entity[]> {
        return this.queryRepo.list(cond, paging)
    }

    async insert(data: Entity): Promise<boolean> {
        return this.cmdRepo.insert(data)
    }

    async update(id: string, data: UpdateDTO): Promise<boolean> {
        return this.cmdRepo.update(id, data)
    }

    async delete(id: string, isHard: boolean): Promise<boolean> {
        return this.cmdRepo.delete(id, isHard)
    }
}

export abstract class BaseQueryRepositorySequelize<Entity,Cond> implements IQueryRepository<Entity,Cond>{
    constructor(
        readonly sequelize: Sequelize,
        readonly modelName: string
    ){}

    async get(id:string): Promise<Entity | null> {
        const data = await this.sequelize.models[this.modelName].findByPk(id)
        if(!data){
            return null
        }
        const persistenceData = data.get({plain:true});
        const {created_at ,updated_at, ...prop} = persistenceData;
        return {
            ...prop,
            createdAt: persistenceData.created_at,
            updatedAt: persistenceData.updated_at,
        } as Entity 
    }

    async findByCond(cond: Cond): Promise<Entity | null> {
        const data = await this.sequelize.models[this.modelName].findOne({ where: cond as any })
        
        if(!data){
            return null
        }
        const persistenceData = data.get({plain:true});
        return persistenceData as Entity;
    }

    async list(cond: Cond, paging: PagingDTO): Promise<Entity[]> {
        const {page, limit} = paging;
        
        const condSQL = {...cond, status: {[Op.ne]: ModelStatus.DELETED}}

        const total  = await this.sequelize.models[this.modelName].count({where: condSQL})
        paging.total = total;

        const rows = await this.sequelize.models[this.modelName].findAll({
            where: condSQL,
            offset: (page - 1) * limit,
            limit
        })

        return rows.map((row) => row.get({plain:true}))
    }
}

export abstract class BaseCommandRepositorySequelize<Entity, UpdateDTO> implements ICommandRepository<Entity, UpdateDTO>{
    constructor(
        readonly sequelize: Sequelize,
        readonly modelName: string
    ){}

    async insert(data: Entity): Promise<boolean> {
        await this.sequelize.models[this.modelName].create(data as any)
        return true
    }

    async update(id: string, data: UpdateDTO): Promise<boolean> {
        await this.sequelize.models[this.modelName].update(data as any, {where: {id}})
        return true
    }

    async delete(id: string, isHard: boolean): Promise<boolean> {
        if(!isHard){
            await this.sequelize.models[this.modelName].update({status: ModelStatus.DELETED}, {where: {id}})
        }
        else{
            await this.sequelize.models[this.modelName].destroy({where: {id}})
        }

    return true
    }

}