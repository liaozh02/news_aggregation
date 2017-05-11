# -*- coding: utf-8 -*-
from sklearn.feature_extraction.text import TfidfVectorizer

doc1 = "British Prime Minister Theresa May shocked her country Tuesday with an unexpected call for June elections, a gamble aimed at increasing her political power at home and enhancing her leverage in Brussels for the high-wire Brexit negotiations. The move amounted to an ambush of Britain’s weak and fractious opposition, giving them just seven weeks to prepare for a vote that had not been due for three more years. Brexit brought May to power; her predecessor, David Cameron, resigned after the humbling defeat of his pro-European Union side in last June’s referendum on whether to leave the trading bloc. If May emerges strengthened from the snap election — as opinion polls currently suggest — she will have greater clout as Britain goes into the complex talks with the remaining 27 E.U. nations, which appear in no mood to offer generous farewell concessions to Britain. But if anti-Brexit voices do well in the polls, May could be forced to soften her demands that Europe provide favorable conditions for the split. No matter how the vote swings, the election campaign is certain to reopen some of the wounds from last year’s referendum, as voters are once again asked to consider what kind of future they envision for Britain after its E.U. break. “I have concluded the only way to guarantee certainty and stability for the years ahead is to hold this election and seek your support for the decisions I have to make,” said May, who last month submitted Britain’s formal request to begin E.U. exit negotiations. May has consolidated power within the Conservative Party. But the lack of her own popular mandate has threatened to become a liability as Britain begins to reckon with the inevitable trade-offs that will come with the Brexit talks. In the election announcement, May argued that her political opponents — from the independence-minded Scots to pro-E.U. factions in Parliament — are undermining Britain’s negotiating position with the European Union. At the same time, some hard-liners in her own Conservative Party are calling for a “dirty Brexit,” in which Britain could walk away from the negotiating table without any deals with the European Union. May is also sensing political opportunity. Her Conservative Party has a narrow majority in Parliament but has opened up a 20-point lead over the opposition Labour Party in recent polls. While May had promised not to call an early election, her allies have been pushing her to break that vow. The Labour Party has been at war with itself since the far-left Jeremy Corbyn became leader in September 2015. A recent poll showed that, in a head-to-head matchup between May and Corbyn, not even a majority of Labour voters would want Corbyn as their prime minister. Corbyn, however, welcomed the snap election as giving “the British people the chance to vote for a government that will put the interests of the majority first.” Other parties are similarly weakened. The far-right U.K. Independence Party has lost its charismatic leader, Nigel Farage, while its central message — that Britain needs to get out of the E.U. — has been co-opted by May. The centrist Liberal Democrats were all but wiped out in the 2015 election, though they will hope to rally the Brexit referendum’s “remain” voters around their unapologetically pro-Europe stance. May planned to seek Parliament’s backing Wednesday for the June 8 election. “We need a general election, and we need one now,” May said, “because we have at this moment a one-off chance to get this done while the European Union agrees its negotiating position and before the detailed talks begin.” One reason so many were stunned by the move is that May had repeatedly ruled out an early election, and she has staked her reputation on doing what she says. The next election was scheduled for 2020. May said that she had “recently and reluctantly” decided that a snap election was the only way to guarantee stability and to stop the “game-playing” in Westminster. She cited several examples of what she called “division” in Parliament, including the Labour Party’s threat to vote against the final deal negotiated with the European Union. Tim Farron, leader of the pro-Europe Liberal Democrat Party, said the election offered an opportunity to urge May to take a more conciliatory line in the E.U. talks. Some critics worry that Britain could lose important trade and other links to Europe by pushing for what May has called a full break from the E.U. There are also concerns over the estimated 3 million E.U. citizens working and living in Britain and the more than 1 million Britons residing across Europe. May said she would seek to preserve their rights. “If you want to avoid a disastrous ‘hard Brexit.’ If you want to keep Britain in the single market. If you want a Britain that is open, tolerant and united, this is your chance. Only the Liberal Democrats can prevent a Conservative majority,” Farron said in a statement. The E.U. bureaucracy, however, has shown little interest in giving Britain an easy landing as it seeks to leave the bloc. E.U. officials are still smarting from Britain’s vote and worried that generous concessions could encourage other E.U. breakaway bids around Europe. European Council President Donald Tusk, a powerful voice in the Brexit talks, summed up the surprise many in Europe felt at May’s announcement. “It was Hitchcock who directed Brexit: first an earthquake and the tension rises,” Tusk wrote on Twitter. Although Britain as a whole voted 52 to 48 percent in favor of leaving the European Union, majorities in both Scotland and Northern Ireland favored staying. Scottish leader Nicola Sturgeon has charged that Scotland’s voters are being taken out of the bloc against their will. And she said last month that she wants a referendum on independence — a rerun of a September 2014 vote, in which a majority of Scottish voters opted to stay in the United Kingdom — between the autumn of 2018 and the spring of 2019. May has repeatedly said that “now is not the time” for a Scottish vote. But she has not threatened to veto another referendum. Moments after Tuesday’s election call, Sturgeon described it as an attempt by May to move the Conservative Party to the right and “force through a hard Brexit and impose deeper cuts.” “Let’s stand up for Scotland,” Sturgeon wrote on Twitter. Witte reported from Paris and Murphy from Washington. Michael Birnbaum in Brussels contributed to this report. As Brexit reshapes Britain, it does the same to Europe Today’s coverage from Post correspondents around the world Like Washington Post World on Facebook and stay updated on foreign news"
doc2 = "UK Prime Minister Theresa May has announced plans to call a snap general election on 8 June. She said Britain needed certainty, stability and strong leadership following the EU referendum. Explaining the decision, Mrs May said: \"The country is coming together but Westminster is not.\" Labour leader Jeremy Corbyn said his party wanted the election, calling it a chance to get a government that puts \"the majority first\". The prime minister will refuse to take part in televised leader debates ahead of the vote, Number 10 sources said. Mr Corbyn said Mrs May should not be \"dodging\" a head-to-head encounter, and the Lib Dems urged broadcasters to \"empty-chair\" the prime minister - hold a debate without her. Live TV debates took place for the first time in a UK general election in 2010, and the experiment was repeated in 2015 using a range of different formats. A BBC spokesman said that it was too early to say whether the broadcaster would put in a bid to stage a debate. There will be a vote in the House of Commons on Wednesday to approve the election plan - the prime minister needs two thirds of MPs to vote in favour to bring forward the next scheduled election date of 2020. Explaining her change of heart on an early election, Mrs May said: \"I have concluded the only way to guarantee certainty and security for years ahead is to hold this election.\" She accused Britain's other political parties of \"game playing\", adding that this risks \"our ability to make a success of Brexit and it will cause damaging uncertainty and instability to the country\". \"So we need a general election and we need one now. We have at this moment a one-off chance to get this done while the European Union agrees its negotiating position and before the detailed talks begin. \"I have only recently and reluctantly come to this conclusion. Since I became prime minister I've said there should be no election until 2020, but now I have concluded that the only way to guarantee certainty and security for the years ahead is to hold this election and seek your support for the decisions we must take.\" In a statement outside Number 10, Mrs May said Labour had threatened to vote against the final Brexit agreement and cited opposition to her plans from the Scottish National Party, the Lib Dems and \"unelected\" members of the House of Lords. \"If we don't hold a general election now, their political game-playing will continue and the negotiations with the European Union will reach their most difficult stage in the run-up to the next scheduled election,\" she said. Senior government sources point to a specific factor that changed the prime minister's calculation on an early election. The end of the likely tortuous Article 50 negotiations is a hard deadline set for March 2019. Under the Fixed Term Parliaments Act, that's when the Tories would be starting to prepare for a general election the following year, with what one cabinet minister described as certain \"political needs\". In other words, the government would be exposed to hardball from the EU because ministers would be desperate to avoid accepting anything that would be politically unpopular, or hold the Brexit process up, at the start of a crucial election cycle. Ministers say that's the central reason for May's change of heart because \"if there was an election in three years, we'd be up against the clock\". The PM challenged the opposition parties: \"Let us tomorrow vote for an election - let us put forward our plans for Brexit and our alternative programmes for government and then let the people decide. \"The decision facing the country will be all about leadership. It will be a choice between strong and stable leadership in the national interest, with me as your prime minister, or weak and unstable coalition government, led by Jeremy Corbyn, propped up by the Liberal Democrats - who want to reopen the divisions of the referendum - and Nicola Sturgeon and the SNP.\" Mr Corbyn said he welcomed the prime minister's decision, saying it would \"give the British people the chance to vote for a government that will put the interests of the majority first\", saying that this would include dealing with \"the crisis\" in housing, education funding and the NHS and pushing for an \"economy that works for all\". He told the BBC: \"I'm starting straight away and I'm looking forward to it and we'll take our message to every single part of this country... We're campaigning to win this election - that's the only question now.\" Asked if he will be the next prime minister, the Labour leader said: \"If we win the election - yes - and I want to lead a government that will transform this country, give real hope to everybody and above all bring about a principle of justice for everybody and economic opportunities for everybody.\" Scotland's First Minister Nicola Sturgeon said she would be fighting the election \"to win\". \"I think the prime minister has called this election for selfish, narrow, party political interests, but she has called it and therefore I relish the prospect of getting out to stand up for Scotland's interests and values, standing up for Scotland's voice being heard and standing against the ability of a right-wing Conservative Party to impose whatever policies it wants on Scotland.\" In his response to Mrs May's announcement, Lib Dem leader Tim Farron tweeted: \"This is your chance to change the direction of your country. If you want to avoid a disastrous hard Brexit. If you want to keep Britain in the single market. If you want a Britain that is open, tolerant and united, this is your chance.\" He also accused the PM of \"bottling\" the TV debates and urged broadcasters to \"empty chair\" her if she refused to take part. Mrs May spoke to the Queen on the phone on Easter Monday to let her know of the election plan, the prime minister's official spokesman said. She also got the full backing of the cabinet before calling the election. Former prime minister David Cameron called Theresa May's decision to hold a snap general election \"brave and right\". In a tweet, he added: \"My very best wishes to all Conservative candidates.\" Another ex-PM, Tony Blair, said voters need to put election candidates under \"sustained pressure\" to say whether or not they would vote against a Brexit deal which does not deliver the same benefits as single market membership - or against a \"damaging\" decision to leave without a deal. \"This should cross party lines,\" he added. British business groups gave a mixed response to the prime minister's sudden call for a general election, as the pound jumped on the news and shares fell. European Council President Donald Tusk's spokesman said the 27 other EU states would forge ahead with Brexit, saying the UK election would not change their plans. He added: \"We expect to have the Brexit guidelines adopted by the European Council on 29 April and following that the Brexit negotiating directives ready on 22 May. This will allow the EU27 to start negotiations."

documents = [doc1, doc2]

tfidf = TfidfVectorizer().fit_transform(documents)
pairwise_sim = tfidf * tfidf.T

print pairwise_sim.A