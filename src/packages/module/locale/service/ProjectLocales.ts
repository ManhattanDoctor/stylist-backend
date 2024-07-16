import { Destroyable } from '@ts-core/common';
import { LanguageLocale, LanguageTranslator } from '@ts-core/language';
import { Injectable } from '@nestjs/common';
import { FileLoader } from './LocaleService';
import * as _ from 'lodash';

@Injectable()
export class ProjectLocales extends Destroyable {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    private _name: string;
    private items: Map<string, LanguageTranslator>;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(name: string) {
        super();
        this._name = name;
        this.items = new Map();
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public async initialize(path: string, locales: Array<string>, prefixes: Array<string>): Promise<void> {
        for (let locale of locales) {
            let item = new LanguageTranslator();
            item.locale = new LanguageLocale(locale, await new FileLoader(`${path}/${this.name}/`, prefixes).load(locale));
            this.items.set(locale, item);
        }
    }

    public async translate(locale: string, key: string, params?: any): Promise<any> {
        return this.items.get(locale).translate(key, params);
    }

    public destroy(): void {
        if (this.isDestroyed) {
            return;
        }
        super.destroy();
        this.items.clear();
        this.items = null;
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    //--------------------------------------------------------------------------

    public get name(): string {
        return this._name;
    }
}
