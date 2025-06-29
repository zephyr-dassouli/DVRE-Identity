import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { 
  ICommandPalette, 
  MainAreaWidget
} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';
import { DVREWidget, AuthWidget, CollaborationWidget } from './components';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'my-extension',
  description: 'My awesome JupyterLab extension',
  autoStart: true,
  requires: [ICommandPalette],
  optional: [ILauncher],
  activate: (
    app: JupyterFrontEnd, 
    palette: ICommandPalette, 
    launcher: ILauncher | null
  ) => {
    console.log('D-VRE is activated!');

    // Command for main extension
    const openCommand = 'my-extension:open';
    app.commands.addCommand(openCommand, {
      label: 'D-VRE',
      caption: 'Open D-VRE panel',
      execute: () => {
        const content = new DVREWidget('D-VRE');
        const widget = new MainAreaWidget({ content });
        widget.id = `my-extension-${Date.now()}`;
        widget.title.closable = true;
        
        app.shell.add(widget, 'main');
        app.shell.activateById(widget.id);
      }
    });

    // Command for authentication
    const authCommand = 'my-extension:auth';
    app.commands.addCommand(authCommand, {
      label: 'Authentication',
      caption: 'Authentication Tool',
      execute: () => {
        const content = new AuthWidget('My Auth Tool');
        const widget = new MainAreaWidget({ content });
        widget.id = `my-auth-${Date.now()}`;
        widget.title.closable = true;
        
        app.shell.add(widget, 'main');
        app.shell.activateById(widget.id);
      }
    });

    // Command for collaboration
    const collaborationCommand = 'my-extension:collaboration';
    app.commands.addCommand(collaborationCommand, {
      label: 'Project Collaboration',
      caption: 'Manage and collaborate on projects',
      execute: () => {
        const content = new CollaborationWidget('Project Collaboration');
        const widget = new MainAreaWidget({ content });
        widget.id = `my-collaboration-${Date.now()}`;
        widget.title.closable = true;
        
        app.shell.add(widget, 'main');
        app.shell.activateById(widget.id);
      }
    });

    // Add to command palette
    palette.addItem({ command: openCommand, category: 'D-VRE' });
    palette.addItem({ command: authCommand, category: 'D-VRE' });
    palette.addItem({ command: collaborationCommand, category: 'D-VRE' });

    if (launcher) {
      launcher.add({
        command: openCommand,
        category: 'D-VRE',
        rank: 1
      });

      launcher.add({
        command: authCommand,
        category: 'D-VRE', 
        rank: 2
      });

      launcher.add({
        command: collaborationCommand,
        category: 'D-VRE',
        rank: 3
      });

      console.log('Extension added to launcher successfully!');
    } else {
      console.log('Launcher not available - extension only in command palette');
    }
  }
};

export default plugin;