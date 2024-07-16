import { Logger, LoggerWrapper } from '@ts-core/common';
import { LanguageFileLoader } from '@ts-core/language';
import { FileUtil } from '@ts-core/backend';
import { Injectable } from '@nestjs/common';
import { LocaleProjectNotFoundError } from '@project/module/core/middleware';
import { ProjectLocales } from './ProjectLocales';
import * as _ from 'lodash';
import { ProjectName } from '@project/common';

@Injectable()
export class LocaleService extends LoggerWrapper {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    private loaders: Map<string, LanguageFileLoader>;
    private projects: Map<string, ProjectLocales>;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(logger: Logger) {
        super(logger);
        this.loaders = new Map();
        this.projects = new Map();
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public async initialize(path: string, projects: Array<string>, locales: Array<string>, prefixes: Array<string>): Promise<void> {
        for (let name of projects) {
            this.loaders.set(name, new FileLoader(`${path}/${name}/`, []));

            let item = new ProjectLocales(name);
            await item.initialize(path, locales, prefixes);
            this.projects.set(item.name, item);
        }
    }

    public async load<T>(project: string, locale: string): Promise<T> {
        let item = this.loaders.get(project);
        if (_.isNil(item)) {
            throw new LocaleProjectNotFoundError(project);
        }
        return item.load(locale);
    }

    public async translate(project: string, locale: string, key: string, params?: any): Promise<any> {
        return this.projects.get(project).translate(locale, key, params);
    }
}

export class FileLoader<T = any> extends LanguageFileLoader<T> {
    protected async loadLocale(locale: string): Promise<T> {
        let items = await Promise.all(this.prefixes.map(name => FileUtil.jsonRead(this.url + locale + name)));
        return this.createLocale(items);
    }
}
