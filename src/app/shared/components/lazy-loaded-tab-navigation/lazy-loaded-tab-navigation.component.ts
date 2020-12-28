import { Component, OnInit } from '@angular/core';
import { tabs } from './TabData';
import { ITabItem } from './ITabItem';

@Component({
  selector: 'app-lazy-loaded-tab-navigation',
  templateUrl: './lazy-loaded-tab-navigation.component.html',
  styleUrls: ['./lazy-loaded-tab-navigation.component.sass'],
})
export class LazyLoadedTabNavigationComponent implements OnInit {
  public tabs: ITabItem[] = tabs;
  constructor() {}

  ngOnInit() {}
}
