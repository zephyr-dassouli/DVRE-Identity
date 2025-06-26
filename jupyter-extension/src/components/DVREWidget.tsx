import { ReactWidget } from '@jupyterlab/ui-components';
import React from 'react';
import DVREComponent from './DVREComponent';

export class DVREWidget extends ReactWidget {
  private _title: string;

  constructor(title: string = 'D-VRE') {
    super();
    this._title = title;
    this.addClass('dvre-widget');
    this.title.label = title;
    this.title.closable = true;
  }

  render(): JSX.Element {
    return <DVREComponent title={this._title} />;
  }
}

export default DVREWidget;
