import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {NetworkService} from './network.service';
import {LedgerHWService} from './services/ledger-h-w.service';
import {ClrWizard} from '@clr/angular';
import {FormGroup} from '@angular/forms';
import {AccountsService} from './accounts.service';
import {EOSJSService} from './eosjs.service';
import {CryptoService} from './services/crypto.service';
import {Router} from '@angular/router';

export interface LedgerSlot {
  publicKey: string;
  account: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('ledgerwizard') ledgerwizard: ClrWizard;
  ledgerOpen: boolean;
  update: boolean;
  ipc: any;
  busy: boolean;
  pksForm: FormGroup;
  accSlots: LedgerSlot[];
  selectedSlot: LedgerSlot;
  selectedSlotIndex: number;
  showAll = false;
  agreeConstitution = false;

  constructor(
    public network: NetworkService,
    public ledger: LedgerHWService,
    public aService: AccountsService,
    public eos: EOSJSService,
    private crypto: CryptoService,
    private router: Router
  ) {
    this.accSlots = [];
    this.selectedSlot = null;
    this.selectedSlotIndex = null;
    this.update = false;

    this.ledgerOpen = false;
    // this.ledger.ledgerStatus.asObservable().subscribe((status) => {
    //   if (this.aService.hasAnyLedgerAccount === false) {
    //     this.ledgerOpen = status;
    //   }
    // });
    this.ledger.openPanel.subscribe((event) => {
      if (event === 'open') {
        this.ledgerOpen = true;
      }
    });

    this.busy = false;
  }

  scanPublicKeys() {
    if (this.ledgerOpen) {
      this.busy = true;
      this.ledger.readPublicKeys(8).then((ledger_slots: LedgerSlot[]) => {
        this.accSlots = ledger_slots;
        this.busy = false;
        console.log(this.accSlots);
      });
    }
  }

  selectSlot(slot: LedgerSlot, index: number) {
    this.selectedSlot = slot;
    this.selectedSlotIndex = index;
    this.ledgerwizard.next();
    console.log(this.selectedSlot);
  }

  importLedgerAccount() {
    this.eos.loadPublicKey(this.selectedSlot.publicKey).then((data: any) => {
      console.log(data);
      this.crypto.storeLedgerAccount(data.publicKey, this.selectedSlotIndex).then(() => {
        this.aService.appendNewAccount(data.foundAccounts[0]);
        setTimeout(() => {
          this.router.navigate(['dashboard', 'vote']).catch((err) => {
            console.log(err);
          });
        }, 1000);
      });
    });
  }

  // checkUpdate() {
  //   this.ipc['send']('checkUpdate', null);
  // }

  // performUpdate() {
  //   // this.ipc['send']('startUpdate', null);
  //   window['shell'].openExternal('https://eosrio.io/simpleos/');
  // }
  //
  // openGithub() {
  //   window['shell'].openExternal('https://github.com/eosrio/simpleos/releases/latest');
  // }

  ngAfterViewInit() {
    setTimeout(()=>{
      this.network.connect();
    },1000);
  }

  // ngOnInit() {
  //   // if (window['ipcRenderer']) {
  //   //   this.ipc = window['ipcRenderer'];
  //   //   this.ipc.on('update_ready', (event, data) => {
  //   //     this.update = data;
  //   //   });
  //   //   setTimeout(() => {
  //   //     this.checkUpdate();
  //   //   }, 5000);
  //   // }
  //   // this.network.connect();
  // }
}
