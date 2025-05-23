import * as vscode from "vscode";
import { Disk } from "../models/Disk";
import { DiskManager } from "../models/DiskManager";
import { DeviceTreeItem } from "./DevicesProvider";
import { Refresher } from "./Refresher";
import { Device } from "../models/Device";

export class DiskTreeItem extends vscode.TreeItem {
  constructor(
    public readonly disk: Disk
  ) {
    const size = (disk.capacity / 1000 / 1000 / 1000).toFixed(0) + "GB";

    super(disk.name, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `Disk: ${disk.id}`;
    this.iconPath = new vscode.ThemeIcon("disk");
    this.description = size;
    this.contextValue = "disk";
  }
}

export class DisksProvider implements vscode.TreeDataProvider<DiskTreeItem> {
  private diskManager: DiskManager;

  private _onDidChangeTreeData: vscode.EventEmitter<
    DiskTreeItem | undefined | null | void
  > = new vscode.EventEmitter<DiskTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    DiskTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(diskManager: DiskManager) {
    this.diskManager = diskManager;
  }

  getTreeItem(element: DiskTreeItem): vscode.TreeItem {
    return element;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  autorefresh(): void {
    const autorefresh = new Refresher<Disk[]>(() => {
      this._onDidChangeTreeData.fire();
    }, (disks1, disks2) => {
      return disks1.length === disks2.length && disks1.every((disk, index) => disk.id === disks2[index].id);
    });
    autorefresh.autorefresh(() => this.diskManager.getDisks());
  }

  async getChildren(element?: DiskTreeItem): Promise<DiskTreeItem[]> {
    const disks = await this.diskManager.getDisks();
    const filteredDisks = disks.filter((disk) => {
      return !disk.id.includes("disk0");
    });
    return Promise.resolve(filteredDisks.map((disk) => new DiskTreeItem(disk)));
  }
}