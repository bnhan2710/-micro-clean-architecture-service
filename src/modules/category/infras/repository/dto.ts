import {  DataTypes, Model , Sequelize } from "sequelize";
import { ModelStatus } from "../../../../share/model/base-model";   
export class CategoryPersistence extends Model {
    declare id: string;
    declare status: ModelStatus;
}

export const modelName = "Category";

export function init(sequelize: Sequelize) {
    CategoryPersistence.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        image: {
            type: DataTypes.STRING,
            allowNull: true
        },

        parentId :{
            type: DataTypes.STRING,
            field: 'parent_id',
            allowNull: true
        },

        description :{
            type: DataTypes.STRING,
            primaryKey: true
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'deleted'),
            allowNull: false,
            defaultValue: ModelStatus.ACTIVE
        }
    }, {
        sequelize,
        modelName: modelName,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'categories'
    });
}