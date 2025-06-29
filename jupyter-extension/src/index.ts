import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { 
  ICommandPalette, 
  MainAreaWidget
} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';
import { LabIcon } from '@jupyterlab/ui-components';
import { AuthWidget, CollaborationWidget } from './components';

// Create icons (you can use built-in icons or create custom SVG icons)
const authIcon = new LabIcon({
  name: 'my-extension:auth',
  svgstr: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>'
});

const collaborationIcon = new LabIcon({
  name: 'my-extension:collaboration',
  svgstr: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/><path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></svg>'
});

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

    // Command for authentication
    const authCommand = 'my-extension:auth';
    app.commands.addCommand(authCommand, {
      label: 'Authentication',
      caption: 'Authentication Tool',
      icon: authIcon,
      execute: () => {
        const content = new AuthWidget('My Auth Tool');
        const widget = new MainAreaWidget({ content });
        widget.id = `my-auth-${Date.now()}`;
        widget.title.closable = true;
        widget.title.icon = authIcon;
        
        app.shell.add(widget, 'main');
        app.shell.activateById(widget.id);
      }
    });

    // Command for collaboration
    const collaborationCommand = 'my-extension:collaboration';
    app.commands.addCommand(collaborationCommand, {
      label: 'Project Collaboration',
      caption: 'Manage and collaborate on projects',
      icon: collaborationIcon,
      execute: () => {
        const content = new CollaborationWidget('Project Collaboration');
        const widget = new MainAreaWidget({ content });
        widget.id = `my-collaboration-${Date.now()}`;
        widget.title.closable = true;
        widget.title.icon = collaborationIcon;
        
        app.shell.add(widget, 'main');
        app.shell.activateById(widget.id);
      }
    });

    // Add to command palette
    palette.addItem({ command: authCommand, category: 'D-VRE' });
    palette.addItem({ command: collaborationCommand, category: 'D-VRE' });

    if (launcher) {
      launcher.add({
        command: authCommand,
        category: 'D-VRE', 
        rank: 1
      });

      launcher.add({
        command: collaborationCommand,
        category: 'D-VRE',
        rank: 2
      });

      console.log('Extension added to launcher successfully!');
    } else {
      console.log('Launcher not available - extension only in command palette');
    }
  }
};

export default plugin;